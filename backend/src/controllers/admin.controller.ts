import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Admin } from '../models/admin.model';
import { Customer } from '../models/customer.model';
import { Transaction } from '../models/transaction.model';
import { AppError } from '../utils/error.util';
import { sendSuccess } from '../utils/response.util';
import { hashData } from '../utils/crypto.util';

/**
 * Create new admin (super admin only)
 */
export const createAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, email, phone, password, role } = req.body;

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingAdmin) {
      throw new AppError('Email or phone already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create admin
    const admin = await Admin.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      role,
    });

    sendSuccess(res, {
      message: 'Admin created successfully',
      admin: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all customers (with pagination)
 */
export const getAllCustomers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const customers = await Customer.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Customer.countDocuments();

    sendSuccess(res, {
      customers,
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
 * Get single customer details
 */
export const getCustomer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    sendSuccess(res, { customer });
  } catch (error) {
    next(error);
  }
};

/**
 * Update customer status (activate/deactivate)
 */
export const updateCustomerStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { isActive } = req.body;

    const customer = await Customer.findByIdAndUpdate(
      customerId,
      { isActive },
      { new: true }
    );

    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    sendSuccess(res, {
      message: `Customer ${isActive ? 'activated' : 'deactivated'} successfully`,
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify customer device
 */
export const verifyDevice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { deviceIdHash } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Find device
    const device = customer.devices.find((d) => d.deviceIdHash === deviceIdHash);
    if (!device) {
      throw new AppError('Device not found', 404);
    }

    // Verify device
    device.isVerified = true;
    device.verifiedAt = new Date();
    device.verifiedBy = req.userId as any;

    await customer.save();

    sendSuccess(res, {
      message: 'Device verified successfully',
      device: {
        deviceIdHash: device.deviceIdHash,
        isVerified: device.isVerified,
        verifiedAt: device.verifiedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending device verifications
 */
export const getPendingDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customers = await Customer.find({
      'devices.isVerified': false,
    });

    const pendingDevices = customers.flatMap((customer) =>
      customer.devices
        .filter((device) => !device.isVerified)
        .map((device) => ({
          customerId: customer._id,
          customerName: `${customer.firstName} ${customer.lastName}`,
          customerEmail: customer.email,
          deviceIdHash: device.deviceIdHash,
          createdAt: device.createdAt,
        }))
    );

    sendSuccess(res, { pendingDevices });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all transactions (with filters)
 */
export const getAllTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const filter: any = {};

    if (req.query.customerId) {
      filter.customerId = req.query.customerId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.type) {
      filter.type = req.query.type;
    }

    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('customerId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName email');

    const total = await Transaction.countDocuments(filter);

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
 * Get dashboard statistics
 */
export const getDashboardStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const totalCustomers = await Customer.countDocuments();
    const activeCustomers = await Customer.countDocuments({ isActive: true });
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });

    // Calculate total balance across all customers
    const balanceAggregation = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalBalance: { $sum: '$balance' },
        },
      },
    ]);

    const totalBalance = balanceAggregation[0]?.totalBalance || 0;

    sendSuccess(res, {
      stats: {
        totalCustomers,
        activeCustomers,
        totalTransactions,
        pendingTransactions,
        totalBalance,
      },
    });
  } catch (error) {
    next(error);
  }
};
