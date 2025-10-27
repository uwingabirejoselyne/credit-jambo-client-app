import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate, requireCustomer } from '../middleware/auth.middleware';
import { validateMongoId, validatePagination } from '../middleware/validation.middleware';
import { body } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

// All transaction routes require customer authentication
router.use(authenticate);
router.use(requireCustomer);

// Deposit
router.post(
  '/deposit',
  [
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    handleValidationErrors,
  ],
  transactionController.customerDeposit
);

// Withdraw
router.post(
  '/withdraw',
  [
    body('amount')
      .notEmpty()
      .withMessage('Amount is required')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be greater than 0'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    handleValidationErrors,
  ],
  transactionController.customerWithdraw
);

// Get transaction history
router.get('/history', validatePagination, transactionController.getTransactionHistory);

// Get single transaction (customer's own)
router.get('/:transactionId', validateMongoId('transactionId'), transactionController.getTransaction);

export default router;
