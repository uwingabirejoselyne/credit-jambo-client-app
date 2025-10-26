import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin, AdminRole } from '../models/admin.model';
import { Customer } from '../models/customer.model';
import { Session, SessionType } from '../models/session.model';
import { AppError } from '../utils/error.util';
import { envConfig } from '../config/env.config';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
      userType?: SessionType;
      sessionId?: string;
    }
  }
}

// JWT payload interface
interface JWTPayload {
  userId: string;
  userType: SessionType;
  sessionId: string;
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = async (
  _req: Request,
  _res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    // Get token from header
    const authHeader = _req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('No token provided', 401);
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, envConfig.JWT_SECRET) as JWTPayload;

    // Check if session exists and is valid
    const session = await Session.findById(decoded.sessionId);
    if (!session || !session.isActive) {
      throw new AppError('Invalid or expired session', 401);
    }

    if (session.expiresAt < new Date()) {
      session.isActive = false;
      await session.save();
      throw new AppError('Session expired', 401);
    }

    // Update last activity
    session.lastActivityAt = new Date();
    await session.save();

    // Attach user info to request
    _req.userId = decoded.userId;
    _req.userType = decoded.userType;
    _req.sessionId = decoded.sessionId;

    // Fetch full user data based on type
    if (decoded.userType === SessionType.CUSTOMER) {
      const customer = await Customer.findById(decoded.userId);
      if (!customer || !customer.isActive) {
        throw new AppError('Customer account not found or inactive', 401);
      }
      _req.user = customer;
    } else if (decoded.userType === SessionType.ADMIN) {
      const admin = await Admin.findById(decoded.userId);
      if (!admin || !admin.isActive) {
        throw new AppError('Admin account not found or inactive', 401);
      }
      _req.user = admin;
    }

    _next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      _next(new AppError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      _next(new AppError('Token expired', 401));
    } else {
      _next(error);
    }
  }
};

/**
 * Require customer authentication
 */
export const requireCustomer = async (
  _req: Request,
  _res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    if (_req.userType !== SessionType.CUSTOMER) {
      throw new AppError('Customer access required', 403);
    }
    _next();
  } catch (error) {
    _next(error);
  }
};

/**
 * Require admin authentication
 */
export const requireAdmin = async (
  req: Request,
  _res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    if (req.userType !== SessionType.ADMIN) {
      throw new AppError('Admin access required', 403);
    }
    _next();
  } catch (error) {
    _next(error);
  }
};

/**
 * Require specific admin role
 */
export const requireRole = (...roles: AdminRole[]) => {
  return async (_req: Request, _res: Response, _next: NextFunction): Promise<void> => {
    try {
      if (_req.userType !== SessionType.ADMIN) {
        throw new AppError('Admin access required', 403);
      }

      const admin = _req.user;
      if (!roles.includes(admin.role)) {
        throw new AppError('Insufficient permissions', 403);
      }

      _next();
    } catch (error) {
      _next(error);
    }
  };
};

/**
 * Verify device for customer login
 */
export const verifyDevice = async (
  _req: Request,
  _res: Response,
  _next: NextFunction
): Promise<void> => {
  try {
    if (_req.userType !== SessionType.CUSTOMER) {
      return _next();
    }

    const deviceIdHash = _req.headers['x-device-id'] as string;
    if (!deviceIdHash) {
      throw new AppError('Device ID required', 400);
    }

    const customer = _req.user;
    const device = customer.devices.find((d: any) => d.deviceIdHash === deviceIdHash);

    if (!device) {
      throw new AppError('Device not registered', 403);
    }

    if (!device.isVerified) {
      throw new AppError('Device not verified. Please contact admin.', 403);
    }

    _next();
  } catch (error) {
    _next(error);
  }
};
