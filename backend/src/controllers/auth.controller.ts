import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { SessionType } from '../models/session.model';
import { sendSuccess } from '../utils/response.util';

/**
 * Register a new customer
 */
export const registerCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, password, deviceId } = req.body;

    const customer = await AuthService.registerCustomer({
      firstName,
      lastName,
      email,
      phone,
      password,
      deviceId,
    });

    sendSuccess(res, {
      message: 'Registration successful. Please wait for admin to verify your device.',
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
      },
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login customer
 */
export const loginCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, deviceId } = req.body;

    const result = await AuthService.loginCustomer({
      email,
      password,
      deviceId,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    sendSuccess(res, {
      message: 'Login successful',
      token: result.token,
      customer: result.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login admin
 */
export const loginAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password, deviceId } = req.body;

    const result = await AuthService.loginAdmin({
      email,
      password,
      deviceId,
      ipAddress: req.ip || '',
      userAgent: req.headers['user-agent'] || '',
    });

    sendSuccess(res, {
      message: 'Login successful',
      token: result.token,
      admin: result.user,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await AuthService.logout(req.sessionId as string);

    sendSuccess(res, { message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh token
 */
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = await AuthService.refreshToken(
      req.userId as string,
      req.userType as SessionType,
      req.sessionId as string
    );

    sendSuccess(res, {
      message: 'Token refreshed',
      token,
    });
  } catch (error) {
    next(error);
  }
};
