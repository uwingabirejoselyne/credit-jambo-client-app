import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
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
    const customer = await CustomerService.getProfile(req.userId as string);

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
 * Change password
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
 * Get customer balance
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
 * Get single transaction details
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
 * Get customer devices
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
