import { Router } from 'express';
import * as transactionController from '../controllers/transaction.controller';
import { authenticate, requireCustomer } from '../middleware/auth.middleware';
import { validateMongoId } from '../middleware/validation.middleware';

const router = Router();

// All transaction routes require customer authentication
router.use(authenticate);
router.use(requireCustomer);

// Get single transaction (customer's own)
router.get('/:transactionId', validateMongoId('transactionId'), transactionController.getTransaction);

export default router;
