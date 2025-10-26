import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../models/customer.model';
import { Admin } from '../models/admin.model';
import { Session, SessionType } from '../models/session.model';
import { AppError } from '../utils/error.util';
import crypto from 'crypto';
import { envConfig } from '../config/env.config';

// Local helper to send success responses (replicates expected sendSuccess behavior)
const sendSuccess = (res: Response, payload: any, status = 200): void => {
  res.status(status).json({ success: true, ...payload });
};

const hashData = (data: string): string => {
  if (!data) return '';
  return crypto.createHash('sha256').update(String(data)).digest('hex');
};

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

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingCustomer) {
      throw new AppError('Email or phone already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Hash device ID
    const deviceIdHash = hashData(deviceId);

    // Create customer with first device (unverified)
    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      devices: [
        {
          deviceId,
          deviceIdHash,
          isVerified: false,
          createdAt: new Date(),
        },
      ],
    });

    sendSuccess(res, {
      message: 'Registration successful. Please wait for admin to verify your device.',
      customer: {
        id: customer._id,
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

    // Find customer with password
    const customer = await Customer.findOne({ email }).select('+password');
    if (!customer) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if customer is active
    if (!customer.isActive) {
      throw new AppError('Account is inactive. Please contact support.', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Hash device ID
    const deviceIdHash = hashData(deviceId);

    // Check if device exists
    const device = customer.devices.find((d) => d.deviceIdHash === deviceIdHash);
    if (!device) {
      throw new AppError('Device not registered', 403);
    }

    // Check if device is verified
    if (!device.isVerified) {
      throw new AppError('Device not verified. Please contact admin.', 403);
    }

    // Update device last login
    device.lastLoginAt = new Date();
    customer.lastLoginAt = new Date();
    await customer.save();

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    const session = await Session.create({
      userId: customer._id,
      userType: SessionType.CUSTOMER,
      token: uuidv4(),
      deviceIdHash,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: customer._id,
        userType: SessionType.CUSTOMER,
        sessionId: session._id,
      },
      envConfig.JWT_SECRET,
      { expiresIn: '24h' }
    );

    sendSuccess(res, {
      message: 'Login successful',
      token,
      customer: {
        id: customer._id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        balance: customer.balance,
      },
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

    // Find admin with password
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if admin is active
    if (!admin.isActive) {
      throw new AppError('Account is inactive. Please contact support.', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Hash device ID
    const deviceIdHash = hashData(deviceId);

    // Create session
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8); // 8 hours for admin

    const session = await Session.create({
      userId: admin._id,
      userType: SessionType.ADMIN,
      token: uuidv4(),
      deviceIdHash,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      expiresAt,
    });

    // Generate JWT
    const token = jwt.sign(
      {
        userId: admin._id,
        userType: SessionType.ADMIN,
        sessionId: session._id,
      },
      envConfig.JWT_SECRET,
      { expiresIn: '8h' }
    );

    sendSuccess(res, {
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
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
    // Deactivate session
    await Session.findByIdAndUpdate(req.sessionId, { isActive: false });

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
    // Session is already validated by authenticate middleware
    const session = await Session.findById(req.sessionId);
    if (!session) {
      throw new AppError('Session not found', 401);
    }

    // Extend session
    const expiresAt = new Date();
    const hours = req.userType === SessionType.ADMIN ? 8 : 24;
    expiresAt.setHours(expiresAt.getHours() + hours);

    session.expiresAt = expiresAt;
    await session.save();

    // Generate new JWT
    const token = jwt.sign(
      {
        userId: req.userId,
        userType: req.userType,
        sessionId: session._id,
      },
      envConfig.JWT_SECRET,
      { expiresIn: `${hours}h` }
    );

    sendSuccess(res, {
      message: 'Token refreshed',
      token,
    });
  } catch (error) {
    next(error);
  }
};
