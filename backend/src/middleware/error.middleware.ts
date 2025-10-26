import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';
import { sendError } from '../utils/response.util';
import { envConfig } from '../config/env.config';

/**
 * Global error handler middlewareS
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  _res: Response,
  _next: NextFunction
): void => {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: envConfig.isDevelopment ? err.stack : undefined,
    url: _req.url,
    method: _req.method,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    sendError(_res, err.message, err.statusCode);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    sendError(_res, err.message, 400);
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    sendError(_res, `${field} already exists`, 409);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(_res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(_res, 'Token expired', 401);
    return;
  }

  // Default error
  sendError(
    _res,
    envConfig.isDevelopment ? err.message : 'Internal server error',
    500
  );
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  _next: NextFunction
): void => {
  _next(new AppError(`Route ${req.originalUrl} not found`, 404));
};
