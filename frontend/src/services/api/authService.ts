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
    const response = await axiosInstance.post<AuthResponse>('/auth/register', data);
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
    const response = await axiosInstance.post<AuthResponse>('/auth/login', data);

    // Store tokens and user data
    if (response.data.success && response.data.data) {
      localStorage.setItem('accessToken', response.data.data.accessToken);
      if (response.data.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.data.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }

    return response.data;
  } catch (error: any) {
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
