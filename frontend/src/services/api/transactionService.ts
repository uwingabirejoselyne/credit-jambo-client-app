import axiosInstance from './axiosConfig';

/**
 * Transaction API service
 * Handles deposits, withdrawals, and transaction history
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
 * Make a deposit
 */
export const deposit = async (data: DepositData): Promise<Transaction> => {
  try {
    const response = await axiosInstance.post<TransactionResponse>('/transactions/deposit', data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Deposit failed');
  } catch (error: any) {
    throw error?.data || error;
  }
};

/**
 * Make a withdrawal
 */
export const withdraw = async (data: WithdrawalData): Promise<Transaction> => {
  try {
    const response = await axiosInstance.post<TransactionResponse>('/transactions/withdraw', data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Withdrawal failed');
  } catch (error: any) {
    throw error?.data || error;
  }
};

/**
 * Get transaction history
 */
export const getTransactionHistory = async (
  page: number = 1,
  limit: number = 10
): Promise<{ transactions: Transaction[]; pagination: any }> => {
  try {
    const response = await axiosInstance.get<TransactionHistoryResponse>(
      `/transactions/history?page=${page}&limit=${limit}`
    );

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch transaction history');
  } catch (error: any) {
    throw error?.data || error;
  }
};

/**
 * Get a single transaction by ID
 */
export const getTransaction = async (id: string): Promise<Transaction> => {
  try {
    const response = await axiosInstance.get<TransactionResponse>(`/transactions/${id}`);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch transaction');
  } catch (error: any) {
    throw error?.data || error;
  }
};
