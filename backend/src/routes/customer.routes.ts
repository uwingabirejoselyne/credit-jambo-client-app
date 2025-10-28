import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { authenticate, requireCustomer } from '../middleware/auth.middleware';
import {
  validateCustomerUpdate,
  validatePagination,
  validateMongoId,
} from '../middleware/validation.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.middleware';

/**
 * @swagger
 * tags:
 *   name: Customers
 *   description: API for managing customer profiles and information
 */

const router = Router();

// All customer routes require authentication
router.use(authenticate);
router.use(requireCustomer);

// Profile routes
router.get('/profile', customerController.getProfile);
router.put('/profile', validateCustomerUpdate, customerController.updateProfile);

// Password change
router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required')
      .isLength({ min: 8 })
      .withMessage('New password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage(
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
      ),
    handleValidationErrors,
  ],
  customerController.changePassword
);

// Balance
router.get('/balance', customerController.getBalance);

// Transactions
router.get('/transactions', validatePagination, customerController.getTransactionHistory);
router.get('/transactions/:transactionId', validateMongoId('transactionId'), customerController.getTransaction);

// Devices
router.get('/devices', customerController.getDevices);

export default router;
