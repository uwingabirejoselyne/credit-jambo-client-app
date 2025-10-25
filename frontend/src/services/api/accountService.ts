import axiosInstance from './axiosConfig';

/**
 * Account API service
 * Handles account balance and user profile operations
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
 * Get user account balance
 */
export const getBalance = async (): Promise<AccountBalance> => {
  try {
    const response = await axiosInstance.get<ApiResponse<AccountBalance>>('/account/balance');

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch balance');
  } catch (error: any) {
    throw error?.data || error;
  }
};

/**
 * Get user profile
 */
export const getProfile = async (): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.get<ApiResponse<UserProfile>>('/account/profile');

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch profile');
  } catch (error: any) {
    throw error?.data || error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    const response = await axiosInstance.put<ApiResponse<UserProfile>>('/account/profile', data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to update profile');
  } catch (error: any) {
    throw error?.data || error;
  }
};
