import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import { envConfig, isDevelopment } from './config/env.config';
import { ResponseUtil } from './utils/response.util';
import { AppError } from './utils/error.util';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // CORS configuration
    this.app.use(cors({
      origin: envConfig.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Compression middleware
    this.app.use(compression());

    // MongoDB injection protection
    this.app.use(mongoSanitize());

    // Logging middleware (only in development)
    if (isDevelopment) {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }

    // Trust proxy (for rate limiting behind reverse proxy)
    this.app.set('trust proxy', 1);
  }

  private initializeRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (_req: Request, res: Response) => {
      ResponseUtil.success(res, 'Server is healthy', {
        status: 'UP',
        timestamp: new Date().toISOString(),
        environment: envConfig.NODE_ENV,
      });
    });

    // API base route
    this.app.get(`/api/${envConfig.API_VERSION}`, (_req: Request, res: Response) => {
      ResponseUtil.success(res, 'Credit Jambo Client API', {
        version: envConfig.API_VERSION,
        documentation: '/api/docs',
      });
    });

    // Routes will be added here
    // this.app.use(`/api/${envConfig.API_VERSION}/auth`, authRoutes);
    // this.app.use(`/api/${envConfig.API_VERSION}/account`, accountRoutes);
    // this.app.use(`/api/${envConfig.API_VERSION}/transactions`, transactionRoutes);

    // 404 handler
    this.app.use('*', (req: Request, res: Response) => {
      ResponseUtil.notFound(res, `Route ${req.originalUrl} not found`);
    });
  }

  private initializeErrorHandling(): void {
    // Global error handler
    this.app.use((err: Error | AppError, _req: Request, res: Response, _next: NextFunction) => {
      if (err instanceof AppError) {
        return ResponseUtil.error(
          res,
          err.message,
          isDevelopment ? err.stack : undefined,
          err.statusCode
        );
      }

      // Handle mongoose validation errors
      if (err.name === 'ValidationError') {
        return ResponseUtil.validationError(res, err.message);
      }

      // Handle mongoose duplicate key errors
      if (err.name === 'MongoServerError' && (err as any).code === 11000) {
        return ResponseUtil.error(res, 'Duplicate field value entered', undefined, 409);
      }

      // Handle JWT errors
      if (err.name === 'JsonWebTokenError') {
        return ResponseUtil.unauthorized(res, 'Invalid token');
      }

      if (err.name === 'TokenExpiredError') {
        return ResponseUtil.unauthorized(res, 'Token expired');
      }

      // Default error
      console.error('Unhandled error:', err);
      return ResponseUtil.serverError(
        res,
        'Something went wrong',
        isDevelopment ? err.message : undefined
      );
    });
  }

  public getApp(): Application {
    return this.app;
  }
}

export default new App().getApp();
