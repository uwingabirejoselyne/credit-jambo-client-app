import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getBalance } from '../../services/api/accountService';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

/**
 * Account Context
 * Manages user account balance and related state
 */

interface AccountContextType {
  balance: number;
  currency: string;
  isLoading: boolean;
  refreshBalance: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider: React.FC<AccountProviderProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('RWF');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasFetched, setHasFetched] = useState<boolean>(false);

  // Fetch balance when user is authenticated - only once
  useEffect(() => {
    if (isAuthenticated && user?.deviceVerified && !hasFetched) {
      refreshBalance();
      setHasFetched(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.deviceVerified]);

  // Refresh balance from API
  const refreshBalance = async (): Promise<void> => {
    try {
      setIsLoading(true);
      const data = await getBalance();
      setBalance(data.balance);
      setCurrency(data.currency);
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      const errorMessage = error?.message || 'Failed to fetch balance';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update balance locally (optimistic update)
  const updateBalance = (newBalance: number): void => {
    setBalance(newBalance);
  };

  const value: AccountContextType = {
    balance,
    currency,
    isLoading,
    refreshBalance,
    updateBalance,
  };

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
};

// Custom hook to use account context
export const useAccount = (): AccountContextType => {
  const context = useContext(AccountContext);

  if (context === undefined) {
    throw new Error('useAccount must be used within an AccountProvider');
  }

  return context;
};
