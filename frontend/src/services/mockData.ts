/**
 * Mock data for testing frontend without backend
 */

export interface MockUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  isVerified: boolean;
  deviceVerified: boolean;
}

export interface MockTransaction {
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

// Mock users database with pre-loaded demo user
const mockUsers: Map<string, any> = new Map();

// Hardcoded demo user - ready to login immediately!
mockUsers.set('demo@creditjambo.com', {
  id: 'user_demo_001',
  email: 'demo@creditjambo.com',
  fullName: 'John Doe',
  phone: '+250788268451',
  password: 'Demo@123', // In real app, this would be hashed
  deviceId: 'demo_device_001',
  isVerified: true,
  deviceVerified: true,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
});

// Mock transactions database
let mockTransactions: MockTransaction[] = [
  {
    id: '1',
    type: 'deposit',
    amount: 50000,
    balance: 50000,
    currency: 'RWF',
    status: 'completed',
    description: 'Initial deposit',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'deposit',
    amount: 25000,
    balance: 75000,
    currency: 'RWF',
    status: 'completed',
    description: 'Monthly savings',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'withdrawal',
    amount: 15000,
    balance: 60000,
    currency: 'RWF',
    status: 'completed',
    description: 'Emergency withdrawal',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'deposit',
    amount: 30000,
    balance: 90000,
    currency: 'RWF',
    status: 'completed',
    description: 'Bonus savings',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'withdrawal',
    amount: 10000,
    balance: 80000,
    currency: 'RWF',
    status: 'completed',
    description: 'Personal expense',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let currentBalance = 80000;
let transactionIdCounter = 6;

// Helper to simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockData = {
  users: mockUsers,
  transactions: mockTransactions,
  currentBalance,
  delay,

  // Add transaction
  addTransaction(transaction: Omit<MockTransaction, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTransaction: MockTransaction = {
      ...transaction,
      id: String(transactionIdCounter++),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTransactions.unshift(newTransaction);
    currentBalance = transaction.balance;
    return newTransaction;
  },

  // Get current balance
  getBalance() {
    return currentBalance;
  },

  // Update balance
  updateBalance(newBalance: number) {
    currentBalance = newBalance;
  },

  // Get transactions with pagination
  getTransactions(page: number = 1, limit: number = 10) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = mockTransactions.slice(startIndex, endIndex);

    return {
      transactions: paginatedTransactions,
      pagination: {
        page,
        limit,
        total: mockTransactions.length,
        totalPages: Math.ceil(mockTransactions.length / limit),
      },
    };
  },
};
