import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { sendSuccess } from '../utils/response.util';

/**
 * @swagger
 * /customers/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
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
 *                     customer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "john.doe@example.com"
 *                         phone:
 *                           type: string
 *                           example: "+1234567890"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Customer not found
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const customer = await CustomerService.getProfile(req.userId as string);

    sendSuccess(res, { customer });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /customers/profile:
 *   put:
 *     summary: Update customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 example: "Doe"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     customer:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "507f1f77bcf86cd799439011"
 *                         firstName:
 *                           type: string
 *                           example: "John"
 *                         lastName:
 *                           type: string
 *                           example: "Doe"
 *                         email:
 *                           type: string
 *                           format: email
 *                           example: "john.doe@example.com"
 *                         phone:
 *                           type: string
 *                           example: "+1234567890"
 *                         isActive:
 *                           type: boolean
 *                           example: true
 *       400:
 *         description: Bad request - invalid input
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Customer not found
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { firstName, lastName, phone } = req.body;

    const customer = await CustomerService.updateProfile(req.userId as string, {
      firstName,
      lastName,
      phone,
    });

    sendSuccess(res, {
      message: 'Profile updated successfully',
      customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /customers/password:
 *   put:
 *     summary: Change customer password
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *                 example: "currentPassword123!"
 *               newPassword:
 *                 type: string
 *                 format: password
 *                 example: "newSecurePassword123!"
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *                   example: "Password changed successfully"
 *       400:
 *         description: Bad request - invalid input
 *       401:
 *         description: Unauthorized - invalid token or wrong current password
 *       404:
 *         description: Customer not found
 */
export const changePassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    await CustomerService.changePassword(req.userId as string, {
      currentPassword,
      newPassword,
    });

    sendSuccess(res, { message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /customers/balance:
 *   get:
 *     summary: Get customer balance
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer balance retrieved successfully
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
 *                     balance:
 *                       type: number
 *                       example: 1250.75
 *                     currency:
 *                       type: string
 *                       example: "USD"
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Customer not found
 */
export const getBalance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const balanceData = await CustomerService.getBalance(req.userId as string);

    sendSuccess(res, balanceData);
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /customers/transactions:
 *   get:
 *     summary: Get customer transaction history
 *     tags: [Customers]
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
 *           default: 20
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
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 100
 *                         totalPages:
 *                           type: integer
 *                           example: 5
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
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await CustomerService.getTransactionHistory(
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
 * /customers/transactions/{transactionId}:
 *   get:
 *     summary: Get single transaction details
 *     tags: [Customers]
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
 *         description: Transaction details retrieved successfully
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
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Transaction not found or does not belong to customer
 */
export const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { transactionId } = req.params;

    const transaction = await CustomerService.getTransaction(
      req.userId as string,
      transactionId
    );

    sendSuccess(res, { transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * @swagger
 * /customers/devices:
 *   get:
 *     summary: Get customer devices
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer devices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "507f1f77bcf86cd799439011"
 *                       deviceId:
 *                         type: string
 *                         example: "device123"
 *                       isVerified:
 *                         type: boolean
 *                         example: true
 *                       lastSeen:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-01-01T00:00:00.000Z"
 *       401:
 *         description: Unauthorized - invalid token
 *       404:
 *         description: Customer not found
 */
export const getDevices = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const devices = await CustomerService.getDevices(req.userId as string);

    sendSuccess(res, { devices });
  } catch (error) {
    next(error);
  }
};
