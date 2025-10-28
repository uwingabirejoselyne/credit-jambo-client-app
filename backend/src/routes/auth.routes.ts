import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  validateCustomerRegistration,
  validateLogin,
} from '../middleware/validation.middleware';

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API for user authentication
 */

const router = Router();

// Public routes
router.post('/register', validateCustomerRegistration, authController.registerCustomer);
router.post('/login/customer', validateLogin, authController.loginCustomer);
router.post('/login/admin', validateLogin, authController.loginAdmin);

// Protected routes
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authenticate, authController.refreshToken);

export default router;
