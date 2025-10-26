import { mockData } from '../mockData';

/**
 * Mock Account Service
 * Simulates backend account operations without actual API calls
 */

export interface AccountBalance {
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  isVerified: boolean;
  deviceVerified: boolean;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

/**
 * Get user account balance (mock)
 */
export const getBalance = async (): Promise<AccountBalance> => {
  await mockData.delay(500);

  return {
    balance: mockData.getBalance(),
    currency: 'RWF',
    lastUpdated: new Date().toISOString(),
  };
};

/**
 * Get user profile (mock)
 */
export const getProfile = async (): Promise<UserProfile> => {
  await mockData.delay(500);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return {
    id: user.id || 'mock_user_1',
    fullName: user.fullName || 'Demo User',
    email: user.email || 'demo@creditjambo.com',
    phone: user.phone || '+250788268451',
    isVerified: user.isVerified || true,
    deviceVerified: user.deviceVerified || true,
    createdAt: new Date().toISOString(),
  };
};

/**
 * Update user profile (mock)
 */
export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  await mockData.delay(500);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const updatedUser = { ...user, ...data };

  localStorage.setItem('user', JSON.stringify(updatedUser));

  return updatedUser;
};
