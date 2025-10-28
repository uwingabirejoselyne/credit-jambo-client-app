import bcrypt from 'bcryptjs';
import { Customer } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';
import { AppError } from '../utils/error.util';

/**
 * Customer Service
 * Handles all customer-related business logic
 */

interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class CustomerService {
  /**
   * Get customer profile by ID
   */
  static async getProfile(customerId: string) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }
    return customer;
  }

  /**
   * Update customer profile
   */
  static async updateProfile(customerId: string, data: UpdateProfileData) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Update fields if provided
    if (data.firstName) customer.firstName = data.firstName;
    if (data.lastName) customer.lastName = data.lastName;

    if (data.phone) {
      // Check if phone is already used by another customer
      const existingCustomer = await Customer.findOne({
        phone: data.phone,
        _id: { $ne: customerId },
      });
      if (existingCustomer) {
        throw new AppError('Phone number already in use', 409);
      }
      customer.phone = data.phone;
    }

    await customer.save();
    return customer;
  }

  /**
   * Change customer password
   */
  static async changePassword(customerId: string, data: ChangePasswordData) {
    const customer = await Customer.findById(customerId).select('+password');
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(data.currentPassword, customer.password);
    if (!isPasswordValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Hash and save new password
    customer.password = await bcrypt.hash(data.newPassword, 12);
    await customer.save();
  }

  /**
   * Get customer balance with low balance warning
   */
  static async getBalance(customerId: string) {
    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    const isLowBalance = customer.balance < customer.lowBalanceThreshold;

    return {
      balance: customer.balance,
      customerId: customer._id,
      lowBalanceWarning: isLowBalance,
      lowBalanceThreshold: customer.lowBalanceThreshold,
    };
  }

  /**
   * Get customer transaction history
   */
  static async getTransactionHistory(
    customerId: string,
    page: number = 1,
    limit: number = 20
  ) {
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ customerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('processedBy', 'firstName lastName email');

    const total = await Transaction.countDocuments({ customerId });

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get single transaction by ID (for customer's own transactions)
   */
  static async getTransaction(customerId: string, transactionId: string) {
    const transaction = await Transaction.findOne({
      _id: transactionId,
      customerId,
    }).populate('processedBy', 'firstName lastName email');

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  /**
   * Get customer devices
   */
  static async getDevices(customerId: string) {
    const customer = await Customer.findById(customerId);
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

    return devices;
  }
}
