import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error.util';
import { sendError } from '../utils/response.util';
import { envConfig } from '../config/env.config';

/**
 * Global error handler middleware
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Log error
  console.error('Error:', {
    message: err.message,
    stack: envConfig.isDevelopment ? err.stack : undefined,
    url: req.url,
    method: req.method,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    sendError(res, err.message, 400);
    return;
  }

  // Handle Mongoose duplicate key errors
  if (err.name === 'MongoServerError' && (err as any).code === 11000) {
    const field = Object.keys((err as any).keyPattern)[0];
    sendError(res, `${field} already exists`, 409);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 401);
    return;
  }

  // Default error
  sendError(
    res,
    envConfig.isDevelopment ? err.message : 'Internal server error',
    500
  );
};

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};
