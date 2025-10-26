import { mockData } from '../mockData';

/**
 * Mock Authentication Service
 * Simulates backend authentication without actual API calls
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
 * Register a new user (mock)
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  await mockData.delay(800);

  // Check if user already exists
  if (mockData.users.has(data.email)) {
    throw {
      message: 'User with this email already exists',
    };
  }

  // Store user in mock database
  const user = {
    id: `user_${Date.now()}`,
    email: data.email,
    fullName: data.fullName,
    phone: data.phone,
    password: data.password, // In real app, this would be hashed
    deviceId: data.deviceId,
    isVerified: false,
    deviceVerified: true, // Auto-verify for demo purposes
    createdAt: new Date().toISOString(),
  };

  mockData.users.set(data.email, user);

  return {
    success: true,
    message: 'Registration successful! You can now login.',
  };
};

/**
 * Login user (mock)
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  await mockData.delay(300);

  const user = mockData.users.get(data.email);

  if (!user) {
    throw {
      message: 'Invalid email or password',
    };
  }

  if (user.password !== data.password) {
    throw {
      message: 'Invalid email or password',
    };
  }

  // Generate mock JWT token
  const accessToken = `mock_token_${Date.now()}`;
  const refreshToken = `mock_refresh_${Date.now()}`;

  const userData = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    phone: user.phone,
    isVerified: user.isVerified,
    deviceVerified: user.deviceVerified,
  };

  // Persist to localStorage immediately
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(userData));

  return {
    success: true,
    message: 'Login successful!',
    data: {
      user: userData,
      accessToken,
      refreshToken,
    },
  };
};

/**
 * Logout user (mock)
 */
export const logout = async (): Promise<void> => {
  await mockData.delay(300);
  // Clear local storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
  localStorage.removeItem('deviceId');
};

/**
 * Refresh access token (mock)
 */
export const refreshToken = async (): Promise<string | null> => {
  await mockData.delay(300);
  const refreshToken = localStorage.getItem('refreshToken');

  if (!refreshToken) {
    return null;
  }

  const newAccessToken = `mock_token_${Date.now()}`;
  localStorage.setItem('accessToken', newAccessToken);
  return newAccessToken;
};

/**
 * Check if token is expired (mock - always return false for demo)
 */
export const isTokenExpired = (token: string): boolean => {
  return false;
};

/**
 * Get current user from localStorage
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
