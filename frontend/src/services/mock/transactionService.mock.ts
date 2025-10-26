import { mockData } from '../mockData';

/**
 * Mock Transaction Service
 * Simulates backend transaction operations without actual API calls
 */

export interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  balance: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepositData {
  amount: number;
  description?: string;
}

export interface WithdrawalData {
  amount: number;
  description?: string;
}

export interface TransactionResponse {
  success: boolean;
  message: string;
  data?: Transaction;
}

export interface TransactionHistoryResponse {
  success: boolean;
  message: string;
  data?: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

/**
 * Make a deposit (mock)
 */
export const deposit = async (data: DepositData): Promise<Transaction> => {
  await mockData.delay(800);

  const currentBalance = mockData.getBalance();
  const newBalance = currentBalance + data.amount;

  const transaction = mockData.addTransaction({
    type: 'deposit',
    amount: data.amount,
    balance: newBalance,
    currency: 'RWF',
    status: 'completed',
    description: data.description,
  });

  return transaction;
};

/**
 * Make a withdrawal (mock)
 */
export const withdraw = async (data: WithdrawalData): Promise<Transaction> => {
  await mockData.delay(800);

  const currentBalance = mockData.getBalance();

  if (data.amount > currentBalance) {
    throw {
      message: 'Insufficient balance',
    };
  }

  const newBalance = currentBalance - data.amount;

  const transaction = mockData.addTransaction({
    type: 'withdrawal',
    amount: data.amount,
    balance: newBalance,
    currency: 'RWF',
    status: 'completed',
    description: data.description,
  });

  return transaction;
};

/**
 * Get transaction history (mock)
 */
export const getTransactionHistory = async (
  page: number = 1,
  limit: number = 10
): Promise<{ transactions: Transaction[]; pagination: any }> => {
  await mockData.delay(600);

  return mockData.getTransactions(page, limit);
};

/**
 * Get a single transaction by ID (mock)
 */
export const getTransaction = async (id: string): Promise<Transaction> => {
  await mockData.delay(500);

  const { transactions } = mockData.getTransactions(1, 100);
  const transaction = transactions.find(t => t.id === id);

  if (!transaction) {
    throw {
      message: 'Transaction not found',
    };
  }

  return transaction;
};
