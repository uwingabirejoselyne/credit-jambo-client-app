import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Customer } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';
import { AppError } from '../utils/error.util';
import { sendSuccess } from '../utils/response.util';

/**
 * Get customer profile
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    sendSuccess(res, { customer });
  } catch (error) {
    next(error);
  }
};

/**
 * Update customer profile
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;

    const customer = await Customer.findById(req.userId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Update fields if provided
    if (firstName) customer.firstName = firstName;
    if (lastName) customer.lastName = lastName;
    if (phone) {
      // Check if phone is already used by another customer
      const existingCustomer = await Customer.findOne({
        phone,
        _id: { $ne: req.userId },
      });
      if (existingCustomer) {
        throw new AppError('Phone number already in use', 409);
      }
      customer.phone = phone;
    }

    await customer.save();

    sendSuccess(res, {
      message: 'Profile updated successfully',
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const customer = await Customer.findById(req.userId).select('+password');
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, customer.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash and save new password
    customer.password = await bcrypt.hash(newPassword, 12);
    await customer.save();

    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer balance
 */
export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    sendSuccess(res, {
      balance: customer.balance,
      customerId: customer._id,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer transaction history
 */
export const getTransactionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ customerId: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('processedBy', 'firstName lastName email');

    const total = await Transaction.countDocuments({ customerId: req.userId });

    sendSuccess(res, {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get single transaction details
 */
export const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findOne({
      _id: transactionId,
      customerId: req.userId,
    }).populate('processedBy', 'firstName lastName email');

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    sendSuccess(res, { transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Get customer devices
 */
export const getDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await Customer.findById(req.userId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Return devices without the actual deviceId (security)
    const devices = customer.devices.map((device) => ({
      id: (device as any)._id ?? (device as any).id,
      deviceIdHash: device.deviceIdHash,
      isVerified: device.isVerified,
      verifiedAt: device.verifiedAt,
      lastLoginAt: device.lastLoginAt,
      createdAt: device.createdAt,
    }));

    sendSuccess(res, { devices });
  } catch (error) {
    next(error);
  }
};
