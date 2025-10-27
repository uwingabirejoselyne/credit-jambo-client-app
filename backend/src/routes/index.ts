import { Router } from 'express';
import authRoutes from './auth.routes';
import customerRoutes from './customer.routes';
import transactionRoutes from './transaction.routes';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/transactions', transactionRoutes);

export default router;
