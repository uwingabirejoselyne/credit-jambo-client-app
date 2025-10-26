import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../models/customer.model';
import { Transaction, TransactionType, TransactionStatus } from '../models/transaction.model';
import { AppError } from '../utils/error.util';
import { sendSuccess } from '../utils/response.util';

/**
 * Create deposit transaction (Admin only)
 */
export const createDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, amount, description } = req.body;

    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    if (!customer.isActive) {
      throw new AppError('Customer account is inactive', 403);
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
      processedBy: req.userId,
      processedAt: new Date(),
    }], { session });

    // Update customer balance
    customer.balance = balanceAfter;
    await customer.save({ session });

    await session.commitTransaction();

    sendSuccess(res, {
      message: 'Deposit successful',
      transaction: transaction[0],
    }, 201);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * Create withdrawal transaction (Admin only)
 */
export const createWithdrawal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { customerId, amount, description } = req.body;

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
      processedBy: req.userId,
      processedAt: new Date(),
    }], { session });

    // Update customer balance
    customer.balance = balanceAfter;
    await customer.save({ session });

    await session.commitTransaction();

    sendSuccess(res, {
      message: 'Withdrawal successful',
      transaction: transaction[0],
    }, 201);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * Create transfer between customers (Admin only)
 */
export const createTransfer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { fromCustomerId, toCustomerId, amount, description } = req.body;

    if (fromCustomerId === toCustomerId) {
      throw new AppError('Cannot transfer to the same account', 400);
    }

    const fromCustomer = await Customer.findById(fromCustomerId).session(session);
    const toCustomer = await Customer.findById(toCustomerId).session(session);

    if (!fromCustomer || !toCustomer) {
      throw new AppError('One or both customers not found', 404);
    }

    if (!fromCustomer.isActive || !toCustomer.isActive) {
      throw new AppError('One or both customer accounts are inactive', 403);
    }

    if (fromCustomer.balance < amount) {
      throw new AppError('Insufficient balance', 400);
    }

    // Create transfer out transaction
    const transferOutTx = await Transaction.create([{
      customerId: fromCustomer._id,
      type: TransactionType.TRANSFER_OUT,
      amount,
      balanceBefore: fromCustomer.balance,
      balanceAfter: fromCustomer.balance - amount,
      status: TransactionStatus.COMPLETED,
      description: description || `Transfer to ${toCustomer.firstName} ${toCustomer.lastName}`,
      reference: `TRF-${uuidv4().substring(0, 8).toUpperCase()}`,
      processedBy: req.userId,
      processedAt: new Date(),
    }], { session });

    // Create transfer in transaction
    const transferInTx = await Transaction.create([{
      customerId: toCustomer._id,
      type: TransactionType.TRANSFER_IN,
      amount,
      balanceBefore: toCustomer.balance,
      balanceAfter: toCustomer.balance + amount,
      status: TransactionStatus.COMPLETED,
      description: description || `Transfer from ${fromCustomer.firstName} ${fromCustomer.lastName}`,
      reference: `TRF-${uuidv4().substring(0, 8).toUpperCase()}`,
      relatedTransactionId: transferOutTx[0]._id,
      processedBy: req.userId,
      processedAt: new Date(),
    }], { session });

    // Link the transactions
    transferOutTx[0].relatedTransactionId = transferInTx[0]._id;
    await transferOutTx[0].save({ session });

    // Update balances
    fromCustomer.balance -= amount;
    toCustomer.balance += amount;

    await fromCustomer.save({ session });
    await toCustomer.save({ session });

    await session.commitTransaction();

    sendSuccess(res, {
      message: 'Transfer successful',
      transactions: {
        transferOut: transferOutTx[0],
        transferIn: transferInTx[0],
      },
    }, 201);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

/**
 * Get transaction by ID
 */
export const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;

    const transaction = await Transaction.findById(transactionId)
      .populate('customerId', 'firstName lastName email')
      .populate('processedBy', 'firstName lastName email')
      .populate('relatedTransactionId');

    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    sendSuccess(res, { transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel pending transaction (Admin only)
 */
export const cancelTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findById(transactionId);
    if (!transaction) {
      throw new AppError('Transaction not found', 404);
    }

    if (transaction.status !== TransactionStatus.PENDING) {
      throw new AppError('Only pending transactions can be cancelled', 400);
    }

    transaction.status = TransactionStatus.CANCELLED;
    transaction.failureReason = reason;
    transaction.processedBy = req.userId as any;
    transaction.processedAt = new Date();

    await transaction.save();

    sendSuccess(res, {
      message: 'Transaction cancelled successfully',
      transaction,
    });
  } catch (error) {
    next(error);
  }
};
