import axiosInstance from './axiosConfig';
import { jwtDecode } from 'jwt-decode';

/**
 * Authentication API service
 * Handles user registration, login, and token management
 */

export interface RegisterData {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  deviceId: string;
}

export interface LoginData {
  email: string;
  password: string;
  deviceId: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      fullName: string;
      phone: string;
      isVerified: boolean;
      deviceVerified: boolean;
    };
    accessToken: string;
    refreshToken?: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    // Split fullName into firstName and lastName
    const nameParts = data.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // If no last name, use first name

    const requestData = {
      firstName,
      lastName,
      email: data.email,
      phone: data.phone,
      password: data.password,
      deviceId: data.deviceId,
    };

    const response = await axiosInstance.post<AuthResponse>('/auth/register', requestData);
    return response.data;
  } catch (error: any) {
    throw error?.data || error;
  }
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.post('/auth/login/customer', data);

    if (response.data.success) {
      // Backend wraps response in data.data structure
      const token = response.data.data?.token;
      const customer = response.data.data?.customer;

      if (!token || !customer) {
        throw new Error("Invalid login response");
      }

      localStorage.setItem('accessToken', token);
      localStorage.setItem('user', JSON.stringify({
        id: customer.id,
        email: customer.email,
        fullName: `${customer.firstName} ${customer.lastName}`,
        phone: customer.phone || '',
        isVerified: true,
        deviceVerified: true,
      }));

      return {
        success: true,
        message: response.data.data?.message || response.data.message,
        data: {
          user: {
            id: customer.id,
            email: customer.email,
            fullName: `${customer.firstName} ${customer.lastName}`,
            phone: customer.phone || '',
            isVerified: true,
            deviceVerified: true,
          },
          accessToken: token,
        }
      };
    }

    throw new Error('Login failed');
  } catch (error: any) {
    console.log(error);
    throw error?.data || error;
  }
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post('/auth/logout');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Clear local storage regardless of API call result
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('deviceId');
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      return null;
    }

    const response = await axiosInstance.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.data.success && response.data.data?.accessToken) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      return response.data.data.accessToken;
    }

    return null;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    const currentTime = Date.now() / 1000;

    // Check if token expires in less than 5 minutes
    return decoded.exp < currentTime + 300;
  } catch (error) {
    return true;
  }
};

/**
 * Get current user from token
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('accessToken');
  return token !== null && !isTokenExpired(token);
};
