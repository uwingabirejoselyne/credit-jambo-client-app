import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AppError } from '../utils/error.util';

/**
 * Handle validation errors
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new AppError(errorMessages.join(', '), 400);
  }
  next();
};

/**
 * Customer registration validation
 */
export const validateCustomerRegistration = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage(
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  handleValidationErrors,
];

/**
 * Login validation
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  body('deviceId').notEmpty().withMessage('Device ID is required'),
  handleValidationErrors,
];

/**
 * Transaction validation
 */
export const validateTransaction = [
  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('type')
    .notEmpty()
    .withMessage('Transaction type is required')
    .isIn(['deposit', 'withdrawal', 'transfer_in', 'transfer_out'])
    .withMessage('Invalid transaction type'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors,
];

/**
 * Customer update validation
 */
export const validateCustomerUpdate = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  handleValidationErrors,
];

/**
 * Admin creation validation
 */
export const validateAdminCreation = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters'),
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['super_admin', 'admin', 'support'])
    .withMessage('Invalid role'),
  handleValidationErrors,
];

/**
 * Device verification validation
 */
export const validateDeviceVerification = [
  param('customerId').isMongoId().withMessage('Invalid customer ID'),
  body('deviceIdHash').notEmpty().withMessage('Device ID hash is required'),
  handleValidationErrors,
];

/**
 * Pagination validation
 */
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors,
];

/**
 * MongoDB ID validation
 */
export const validateMongoId = (paramName: string = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
  handleValidationErrors,
];
