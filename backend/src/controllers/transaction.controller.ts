import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { TransactionService } from '../services/transaction.service';
import { Customer } from '../models/customer.model';
import { Transaction, TransactionType, TransactionStatus } from '../models/transaction.model';
import { AppError } from '../utils/error.util';
import { sendSuccess } from '../utils/response.util';

/**
 * @swagger
 * /transactions/deposit:
 *   post:
 *     summary: Create deposit transaction (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - amount
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               amount:
 *                 type: number
 *                 example: 100.00
 *                 minimum: 0.01
 *               description:
 *                 type: string
 *                 example: "Deposit description"
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Deposit successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Deposit successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         customerId:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         type:
 *                           type: string
 *                           example: "DEPOSIT"
 *                         amount:
 *                           type: number
 *                           example: 100.00
 *                         balanceBefore:
 *                           type: number
 *                           example: 1000.00
 *                         balanceAfter:
 *                           type: number
 *                           example: 1100.00
 *                         status:
 *                           type: string
 *                           example: "COMPLETED"
 *                         description:
 *                           type: string
 *                           example: "Deposit description"
 *                         reference:
 *                           type: string
 *                           example: "DEP-ABC123"
 *                         processedBy:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - invalid input
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Customer not found
 */
export const createDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerId, amount, description } = req.body;

    const transaction = await TransactionService.adminCreateDeposit(
      customerId,
      amount,
      description,
      req.userId as string
    );

    sendSuccess(res, {
      message: 'Deposit successful',
      transaction,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /transactions/withdraw:
 *   post:
 *     summary: Create withdrawal transaction (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - amount
 *             properties:
 *               customerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               amount:
 *                 type: number
 *                 example: 50.00
 *                 minimum: 0.01
 *               description:
 *                 type: string
 *                 example: "Withdrawal description"
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Withdrawal successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Withdrawal successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         customerId:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         type:
 *                           type: string
 *                           example: "WITHDRAWAL"
 *                         amount:
 *                           type: number
 *                           example: 50.00
 *                         balanceBefore:
 *                           type: number
 *                           example: 1100.00
 *                         balanceAfter:
 *                           type: number
 *                           example: 1050.00
 *                         status:
 *                           type: string
 *                           example: "COMPLETED"
 *                         description:
 *                           type: string
 *                           example: "Withdrawal description"
 *                         reference:
 *                           type: string
 *                           example: "WDR-ABC123"
 *                         processedBy:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - invalid input
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Customer not found
 */
export const createWithdrawal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { customerId, amount, description } = req.body;

    const transaction = await TransactionService.adminCreateWithdrawal(
      customerId,
      amount,
      description,
      req.userId as string
    );

    sendSuccess(res, {
      message: 'Withdrawal successful',
      transaction,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /transactions/transfer:
 *   post:
 *     summary: Create transfer between customers (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fromCustomerId
 *               - toCustomerId
 *               - amount
 *             properties:
 *               fromCustomerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439011"
 *               toCustomerId:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               amount:
 *                 type: number
 *                 example: 75.00
 *                 minimum: 0.01
 *               description:
 *                 type: string
 *                 example: "Transfer description"
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Transfer successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transfer successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: object
 *                       properties:
 *                         transferOut:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "507f1f77bcf86cd799439013"
 *                             type:
 *                               type: string
 *                               example: "TRANSFER_OUT"
 *                             amount:
 *                               type: number
 *                               example: 75.00
 *                             balanceBefore:
 *                               type: number
 *                               example: 1000.00
 *                             balanceAfter:
 *                               type: number
 *                               example: 925.00
 *                             status:
 *                               type: string
 *                               example: "COMPLETED"
 *                             description:
 *                               type: string
 *                               example: "Transfer to John Doe"
 *                             reference:
 *                               type: string
 *                               example: "TRF-ABC123"
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2023-01-01T00:00:00.000Z"
 *                         transferIn:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "507f1f77bcf86cd799439014"
 *                             type:
 *                               type: string
 *                               example: "TRANSFER_IN"
 *                             amount:
 *                               type: number
 *                               example: 75.00
 *                             balanceBefore:
 *                               type: number
 *                               example: 500.00
 *                             balanceAfter:
 *                               type: number
 *                               example: 575.00
 *                             status:
 *                               type: string
 *                               example: "COMPLETED"
 *                             description:
 *                               type: string
 *                               example: "Transfer from Jane Smith"
 *                             reference:
 *                               type: string
 *                               example: "TRF-ABC123"
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - invalid input or insufficient balance
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions or inactive account
 *       404:
 *         description: Customer not found
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
    }], { session }) as any;

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
    }], { session }) as any;

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
 * Customer deposit (Self-service)
 */
export const customerDeposit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, description } = req.body;

    const transaction = await TransactionService.customerDeposit(
      req.userId as string,
      { amount, description }
    );

    sendSuccess(res, {
      message: 'Deposit successful',
      data: transaction,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /transactions/withdraw:
 *   post:
 *     summary: Create customer withdrawal transaction (self-service)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50.00
 *                 minimum: 0.01
 *               description:
 *                 type: string
 *                 example: "Withdrawal description"
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Withdrawal successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Withdrawal successful"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         type:
 *                           type: string
 *                           example: "WITHDRAWAL"
 *                         amount:
 *                           type: number
 *                           example: 50.00
 *                         balanceBefore:
 *                           type: number
 *                           example: 1000.00
 *                         balanceAfter:
 *                           type: number
 *                           example: 950.00
 *                         status:
 *                           type: string
 *                           example: "COMPLETED"
 *                         description:
 *                           type: string
 *                           example: "Withdrawal description"
 *                         reference:
 *                           type: string
 *                           example: "WDR-ABC123"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - invalid input or insufficient balance
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 */
export const customerWithdraw = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount, description } = req.body;

    const transaction = await TransactionService.customerWithdraw(
      req.userId as string,
      { amount, description }
    );

    sendSuccess(res, {
      message: 'Withdrawal successful',
      data: transaction,
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /transactions/history:
 *   get:
 *     summary: Get customer transaction history
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of transactions per page
 *     responses:
 *       200:
 *         description: Transaction history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     transactions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "507f1f77bcf86cd799439011"
 *                           type:
 *                             type: string
 *                             example: "DEPOSIT"
 *                           amount:
 *                             type: number
 *                             example: 100.00
 *                           balanceBefore:
 *                             type: number
 *                             example: 1000.00
 *                           balanceAfter:
 *                             type: number
 *                             example: 1100.00
 *                           status:
 *                             type: string
 *                             example: "COMPLETED"
 *                           description:
 *                             type: string
 *                             example: "Deposit transaction"
 *                           reference:
 *                             type: string
 *                             example: "DEP-ABC123"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-01-01T00:00:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 10
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Customer not found
 */
export const getTransactionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await TransactionService.getTransactionHistory(
      req.userId as string,
      page,
      limit
    );

    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /transactions/{transactionId}:
 *   get:
 *     summary: Get transaction by ID
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the transaction to retrieve
 *     responses:
 *       200:
 *         description: Transaction retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         type:
 *                           type: string
 *                           example: "DEPOSIT"
 *                         amount:
 *                           type: number
 *                           example: 100.00
 *                         balanceBefore:
 *                           type: number
 *                           example: 1000.00
 *                         balanceAfter:
 *                           type: number
 *                           example: 1100.00
 *                         status:
 *                           type: string
 *                           example: "COMPLETED"
 *                         description:
 *                           type: string
 *                           example: "Deposit transaction"
 *                         reference:
 *                           type: string
 *                           example: "DEP-ABC123"
 *                         processedBy:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Transaction not found
 */
export const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;

    const transaction = await TransactionService.getTransaction(transactionId);

    sendSuccess(res, { transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /transactions/{transactionId}:
 *   delete:
 *     summary: Cancel pending transaction (Admin only)
 *     tags: [Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the transaction to cancel
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reason
 *             properties:
 *               reason:
 *                 type: string
 *                 example: "Fraudulent transaction"
 *                 description: Reason for cancelling the transaction
 *     responses:
 *       200:
 *         description: Transaction cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Transaction cancelled successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     transaction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         type:
 *                           type: string
 *                           example: "DEPOSIT"
 *                         amount:
 *                           type: number
 *                           example: 100.00
 *                         balanceBefore:
 *                           type: number
 *                           example: 1000.00
 *                         balanceAfter:
 *                           type: number
 *                           example: 1100.00
 *                         status:
 *                           type: string
 *                           example: "CANCELLED"
 *                         description:
 *                           type: string
 *                           example: "Deposit transaction"
 *                         failureReason:
 *                           type: string
 *                           example: "Fraudulent transaction"
 *                         reference:
 *                           type: string
 *                           example: "DEP-ABC123"
 *                         processedBy:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *                         processedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - transaction is not pending
 *       401:
 *         description: Unauthorized - invalid token
 *       403:
 *         description: Forbidden - insufficient permissions
 *       404:
 *         description: Transaction not found
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
