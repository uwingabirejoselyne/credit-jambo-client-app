import dotenv from 'dotenv';

dotenv.config();

interface EnvConfig {
  isDevelopment: any;
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;
  MONGODB_URI: string;
  MONGODB_URI_TEST: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  BCRYPT_ROUNDS: number;
  SESSION_TIMEOUT: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

export const envConfig: EnvConfig = {
  NODE_ENV: getEnvVariable('NODE_ENV', 'development'),
  PORT: parseInt(getEnvVariable('PORT', '5000'), 10),
  API_VERSION: getEnvVariable('API_VERSION', 'v1'),
  MONGODB_URI: getEnvVariable('MONGODB_URI'),
  MONGODB_URI_TEST: getEnvVariable('MONGODB_URI_TEST', ''),
  JWT_SECRET: getEnvVariable('JWT_SECRET'),
  JWT_EXPIRES_IN: getEnvVariable('JWT_EXPIRES_IN', '24h'),
  JWT_REFRESH_SECRET: getEnvVariable('JWT_REFRESH_SECRET'),
  JWT_REFRESH_EXPIRES_IN: getEnvVariable('JWT_REFRESH_EXPIRES_IN', '7d'),
  BCRYPT_ROUNDS: parseInt(getEnvVariable('BCRYPT_ROUNDS', '12'), 10),
  SESSION_TIMEOUT: getEnvVariable('SESSION_TIMEOUT', '30m'),
  RATE_LIMIT_WINDOW_MS: parseInt(getEnvVariable('RATE_LIMIT_WINDOW_MS', '900000'), 10),
  RATE_LIMIT_MAX_REQUESTS: parseInt(getEnvVariable('RATE_LIMIT_MAX_REQUESTS', '100'), 10),
  CORS_ORIGIN: getEnvVariable('CORS_ORIGIN', 'http://localhost:3000'),
  LOG_LEVEL: getEnvVariable('LOG_LEVEL', 'info'),
  isDevelopment: undefined
};

export const isProduction = envConfig.NODE_ENV === 'production';
export const isDevelopment = envConfig.NODE_ENV === 'development';
export const isTest = envConfig.NODE_ENV === 'test';
