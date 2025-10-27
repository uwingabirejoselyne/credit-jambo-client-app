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
 * Safe log helper to avoid undefined data confusion
 */
const safeLogRequest = (method: string, url: string, data?: unknown) => {
  const log: any = { method, url };
  if (data !== undefined) log.data = data;
  console.log("API Request:", log);
};

/**
 * Get user account balance
 */
export const getBalance = async (): Promise<AccountBalance> => {
  try {
    safeLogRequest('GET', '/customers/balance');

    const response = await axiosInstance.get<ApiResponse<AccountBalance>>('/customers/balance');

    console.log("API Response:", response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch balance');
  } catch (error: any) {
    console.error("API Error:", error?.data || error.message);
    throw error?.data || error;
  }
};

/**
 * Get user profile
 */
export const getProfile = async (): Promise<UserProfile> => {
  try {
    safeLogRequest('GET', '/customers/profile');

    const response = await axiosInstance.get<ApiResponse<UserProfile>>('/account/profile');

    console.log("API Response:", response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to fetch profile');
  } catch (error: any) {
    console.error("API Error:", error?.data || error.message);
    throw error?.data || error;
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<UserProfile>): Promise<UserProfile> => {
  try {
    safeLogRequest('PUT', '/customers/profile', data);

    const response = await axiosInstance.put<ApiResponse<UserProfile>>('/account/profile', data);

    console.log("API Response:", response.data);

    if (response.data.success && response.data.data) {
      return response.data.data;
    }

    throw new Error(response.data.message || 'Failed to update profile');
  } catch (error: any) {
    console.error("API Error:", error?.data || error.message);
    throw error?.data || error;
  }
};
