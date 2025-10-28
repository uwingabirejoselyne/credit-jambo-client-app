import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../models/customer.model';
import { Transaction, TransactionType, TransactionStatus } from '../models/transaction.model';
import { AppError } from '../utils/error.util';

/**
 * Transaction Service
 * Handles all transaction-related business logic
 */

interface TransactionData {
  amount: number;
  description?: string;
}

export class TransactionService {
  /**
   * Customer deposit (Self-service)
   */
  static async customerDeposit(customerId: string, data: TransactionData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { amount, description } = data;

      const customer = await Customer.findById(customerId).session(session);
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      if (!customer.isActive) {
        throw new AppError('Account is inactive', 403);
      }

      const balanceBefore = customer.balance;
      const balanceAfter = balanceBefore + amount;

      // Create transaction
      const transaction = await Transaction.create([{
        customerId: customer._id,
        type: TransactionType.DEPOSIT,
        amount,
        balanceBefore,
        balanceAfter,
        status: TransactionStatus.COMPLETED,
        description,
        reference: `DEP-${uuidv4().substring(0, 8).toUpperCase()}`,
        processedAt: new Date(),
      }], { session });

      // Update customer balance
      customer.balance = balanceAfter;
      await customer.save({ session });

      await session.commitTransaction();

      return transaction[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Customer withdrawal (Self-service)
   */
  static async customerWithdraw(customerId: string, data: TransactionData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { amount, description } = data;

      const customer = await Customer.findById(customerId).session(session);
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      if (!customer.isActive) {
        throw new AppError('Account is inactive', 403);
      }

      const balanceBefore = customer.balance;

      // Prevent withdrawals exceeding balance
      if (balanceBefore < amount) {
        throw new AppError('Insufficient balance', 400);
      }

      const balanceAfter = balanceBefore - amount;

      // Create transaction
      const transaction = await Transaction.create([{
        customerId: customer._id,
        type: TransactionType.WITHDRAWAL,
        amount,
        balanceBefore,
        balanceAfter,
        status: TransactionStatus.COMPLETED,
        description,
        reference: `WTH-${uuidv4().substring(0, 8).toUpperCase()}`,
        processedAt: new Date(),
      }], { session });

      // Update customer balance
      customer.balance = balanceAfter;
      await customer.save({ session });

      await session.commitTransaction();

      return transaction[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get transaction history for customer
   */
  static async getTransactionHistory(
    customerId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const skip = (page - 1) * limit;

    const transactions = await Transaction.find({ customerId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments({ customerId });

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get transaction by ID
   */
  static async getTransaction(transactionId: string) {
    const transaction = await Transaction.findById(transactionId)
      .populate('customerId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName email')
      .populate('relatedTransactionId');

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    return transaction;
  }

  /**
   * Admin: Create deposit transaction
   */
  static async adminCreateDeposit(
    customerId: string,
    amount: number,
    description: string | undefined,
    adminId: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const customer = await Customer.findById(customerId).session(session);
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      if (!customer.isActive) {
        throw new AppError('Customer account is inactive', 403);
      }

      const balanceBefore = customer.balance;
      const balanceAfter = balanceBefore + amount;

      const transaction = await Transaction.create([{
        customerId: customer._id,
        type: TransactionType.DEPOSIT,
        amount,
        balanceBefore,
        balanceAfter,
        status: TransactionStatus.COMPLETED,
        description,
        reference: `DEP-${uuidv4().substring(0, 8).toUpperCase()}`,
        processedBy: adminId,
        processedAt: new Date(),
      }], { session });

      customer.balance = balanceAfter;
      await customer.save({ session });

      await session.commitTransaction();

      return transaction[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Admin: Create withdrawal transaction
   */
  static async adminCreateWithdrawal(
    customerId: string,
    amount: number,
    description: string | undefined,
    adminId: string
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const customer = await Customer.findById(customerId).session(session);
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }

      if (!customer.isActive) {
        throw new AppError('Customer account is inactive', 403);
      }

      const balanceBefore = customer.balance;

      if (balanceBefore < amount) {
        throw new AppError('Insufficient balance', 400);
      }

      const balanceAfter = balanceBefore - amount;

      const transaction = await Transaction.create([{
        customerId: customer._id,
        type: TransactionType.WITHDRAWAL,
        amount,
        balanceBefore,
        balanceAfter,
        status: TransactionStatus.COMPLETED,
        description,
        reference: `WTH-${uuidv4().substring(0, 8).toUpperCase()}`,
        processedBy: adminId,
        processedAt: new Date(),
      }], { session });

      customer.balance = balanceAfter;
      await customer.save({ session });

      await session.commitTransaction();

      return transaction[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}
