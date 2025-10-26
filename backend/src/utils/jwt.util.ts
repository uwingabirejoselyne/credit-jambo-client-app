import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.config';

export interface JwtPayload {
  userId: string;
  email: string;
  deviceId: string;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export class JwtUtil {
  /**
   * Generate access token
   */
  static generateAccessToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload as object, envConfig.JWT_SECRET, {
      expiresIn: envConfig.JWT_EXPIRES_IN as any,
    });
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload as object, envConfig.JWT_REFRESH_SECRET, {
      expiresIn: envConfig.JWT_REFRESH_EXPIRES_IN as any,
    });
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, envConfig.JWT_REFRESH_SECRET) as JwtPayload;
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Decode token without verification (for inspection)
   */
  static decodeToken(token: string): JwtPayload | null {
    try {
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}
