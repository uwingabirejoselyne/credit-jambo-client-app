import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { envConfig } from '../config/env.config';

/**
 * Hash password using SHA-512 and bcrypt for additional security
 * We use a combination approach:
 * 1. SHA-512 to hash the password initially
 * 2. bcrypt on the SHA-512 hash for additional security and salt
 */
export class CryptoUtil {
  /**
   * Hash a password using SHA-512 then bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    // First, hash with SHA-512
    const sha512Hash = crypto
      .createHash('sha512')
      .update(password)
      .digest('hex');

    // Then hash the SHA-512 result with bcrypt for additional security
    const bcryptHash = await bcrypt.hash(sha512Hash, envConfig.BCRYPT_ROUNDS);

    return bcryptHash;
  }

  /**
   * Verify a password against a hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    // First, hash the input password with SHA-512
    const sha512Hash = crypto
      .createHash('sha512')
      .update(password)
      .digest('hex');

    // Then compare with bcrypt
    return await bcrypt.compare(sha512Hash, hash);
  }

  /**
   * Generate a random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash a device ID for storage
   */
  static hashDeviceId(deviceId: string): string {
    return crypto
      .createHash('sha256')
      .update(deviceId)
      .digest('hex');
  }

  /**
   * Generate a unique session ID
   */
  static generateSessionId(): string {
    return `${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
  }
}
