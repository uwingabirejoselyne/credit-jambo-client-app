import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../models/customer.model';
import { Admin } from '../models/admin.model';
import { Session, SessionType } from '../models/session.model';
import { AppError } from '../utils/error.util';
import { hashData } from '../utils/crypto.util';
import { envConfig } from '../config/env.config';

/**
 * Authentication Service
 * Handles all authentication-related business logic
 */

interface RegisterCustomerData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  deviceId: string;
}

interface LoginData {
  email: string;
  password: string;
  deviceId: string;
  ipAddress?: string;
  userAgent?: string;
}

interface AuthResult {
  token: string;
  user: any;
}

export class AuthService {
  /**
   * Register a new customer
   */
  static async registerCustomer(data: RegisterCustomerData) {
    const { firstName, lastName, email, phone, password, deviceId } = data;

    // Check if customer already exists
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }],
    });

    if (existingCustomer) {
      throw new AppError('Email or phone already registered', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Hash device ID
    const deviceIdHash = hashData(deviceId);

    // Create customer with first device (unverified)
    const customer = await Customer.create({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword,
      devices: [
        {
          deviceId,
          deviceIdHash,
          isVerified: false,
          createdAt: new Date(),
        },
      ],
    });

    return {
      id: customer._id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
    };
  }

  /**
   * Login customer
   */
  static async loginCustomer(data: LoginData): Promise<AuthResult> {
    const { email, password, deviceId, ipAddress, userAgent } = data;

    // Find customer with password
    const customer = await Customer.findOne({ email }).select('+password');
    if (!customer) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if customer is active
    if (!customer.isActive) {
      throw new AppError('Account is inactive. Please contact support.', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, customer.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Hash device ID
    const deviceIdHash = hashData(deviceId);

    // Check if device exists
    const device = customer.devices.find((d) => d.deviceIdHash === deviceIdHash);
    if (!device) {
      throw new AppError('Device not registered', 403);
    }

    // Check if device is verified
    if (!device.isVerified) {
      throw new AppError('Device not verified. Please contact admin.', 403);
    }

    // Update device last login
    device.lastLoginAt = new Date();
    customer.lastLoginAt = new Date();
    await customer.save();

    // First delete old sessions for this device to prevent token conflicts
    await Session.deleteMany({
      userId: customer._id,
      deviceIdHash,
    });

    // Create session in a transaction-safe manner to avoid race conditions
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    // More comprehensive cleanup using a single atomic operation approach
    // First, delete all existing sessions for this user and device
    const deleteResult = await Session.deleteMany({
      userId: customer._id,
      deviceIdHash,
    });
    console.log(`Deleted ${deleteResult.deletedCount} existing sessions for customer ${customer._id}, device ${deviceIdHash}`);

    // Additionally, clean up any other expired or inactive sessions for the user
    const cleanupResult = await Session.deleteMany({
      userId: customer._id,
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      ]
    });
    console.log(`Cleaned up ${cleanupResult.deletedCount} expired/inactive sessions for customer ${customer._id}`);

    // Verify no sessions exist for this user and device before creating a new one
    const remainingSessions = await Session.find({
      userId: customer._id,
      deviceIdHash,
    });
    console.log(`Found ${remainingSessions.length} remaining sessions for customer ${customer._id}, device ${deviceIdHash} before creating new session`);
    
    // Wait a moment to ensure the database operations complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Now create the new session directly with a fresh UUID
    // Use a try-catch with the knowledge that we cleaned up all sessions for this user/device
    const sessionToken = uuidv4();
    console.log(`Creating new session with token: ${sessionToken.substring(0, 8)}...`);
    
    const session = await Session.create({
      userId: customer._id,
      userType: SessionType.CUSTOMER,
      token: sessionToken,
      deviceIdHash,
      ipAddress,
      userAgent,
      expiresAt,
    });

    // Additional safety check to ensure no duplicate sessions exist for this combination
    // If by some chance duplicates exist after creation, remove them
    const duplicateSessions = await Session.find({
      userId: customer._id,
      deviceIdHash,
    }).sort({ createdAt: -1 });

    if (duplicateSessions.length > 1) {
      console.log(`Found ${duplicateSessions.length} duplicate sessions, cleaning up...`);
      // Keep only the most recent session, delete the others
      const sessionsToDelete = duplicateSessions.slice(1);
      for (const dupSession of sessionsToDelete) {
        await Session.findByIdAndDelete(dupSession._id);
      }
    }
    
    console.log(`Successfully created session with ID: ${session._id}`);

    // Generate JWT
    const token = jwt.sign(
      {
        userId: customer._id,
        userType: SessionType.CUSTOMER,
        sessionId: session._id,
      },
      envConfig.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: customer._id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        balance: customer.balance,
      },
    };
  }

  /**
   * Login admin
   */
  static async loginAdmin(data: LoginData): Promise<AuthResult> {
    const { email, password, deviceId, ipAddress, userAgent } = data;

    // Find admin with password
    const admin = await Admin.findOne({ email }).select('+password');
    if (!admin) {
      throw new AppError('Invalid credentials', 401);
    }

    // Check if admin is active
    if (!admin.isActive) {
      throw new AppError('Account is inactive. Please contact support.', 403);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    // Update last login
    admin.lastLoginAt = new Date();
    await admin.save();

    // Hash device ID
    const deviceIdHash = hashData(deviceId);

    // More comprehensive cleanup using a single atomic operation approach
    // First, delete all existing sessions for this user and device
    const deleteResult = await Session.deleteMany({
      userId: admin._id,
      deviceIdHash,
    });
    console.log(`Deleted ${deleteResult.deletedCount} existing sessions for admin ${admin._id}, device ${deviceIdHash}`);

    // Additionally, clean up any other expired or inactive sessions for the user
    const cleanupResult = await Session.deleteMany({
      userId: admin._id,
      $or: [
        { expiresAt: { $lt: new Date() } },
        { isActive: false }
      ]
    });
    console.log(`Cleaned up ${cleanupResult.deletedCount} expired/inactive sessions for admin ${admin._id}`);

    // Verify no sessions exist for this user and device before creating a new one
    const remainingSessions = await Session.find({
      userId: admin._id,
      deviceIdHash,
    });
    console.log(`Found ${remainingSessions.length} remaining sessions for admin ${admin._id}, device ${deviceIdHash} before creating new session`);
    
    // Wait a moment to ensure the database operations complete
    await new Promise(resolve => setTimeout(resolve, 50));

    // Create session with correct expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 8); // 8 hours for admin

    // Now create the new session directly with a fresh UUID
    const sessionToken = uuidv4();
    console.log(`Creating new admin session with token: ${sessionToken.substring(0, 8)}...`);
    
    const session = await Session.create({
      userId: admin._id,
      userType: SessionType.ADMIN,
      token: sessionToken,
      deviceIdHash,
      ipAddress,
      userAgent,
      expiresAt,
    });

    // Additional safety check to ensure no duplicate sessions exist for this combination
    // If by some chance duplicates exist after creation, remove them
    const duplicateSessions = await Session.find({
      userId: admin._id,
      deviceIdHash,
    }).sort({ createdAt: -1 });

    if (duplicateSessions.length > 1) {
      console.log(`Found ${duplicateSessions.length} duplicate admin sessions, cleaning up...`);
      // Keep only the most recent session, delete the others
      const sessionsToDelete = duplicateSessions.slice(1);
      for (const dupSession of sessionsToDelete) {
        await Session.findByIdAndDelete(dupSession._id);
      }
    }
    
    console.log(`Successfully created admin session with ID: ${session._id}`);

    // Generate JWT
    const token = jwt.sign(
      {
        userId: admin._id,
        userType: SessionType.ADMIN,
        sessionId: session._id,
      },
      envConfig.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return {
      token,
      user: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      },
    };
  }

  /**
   * Logout user
   */
  static async logout(sessionId: string): Promise<void> {
    // Mark session as inactive instead of deleting to maintain audit trail
    await Session.findByIdAndUpdate(sessionId, { isActive: false });
    
    // Additionally, try to find and clean up any duplicate or conflicting sessions
    // This helps prevent sessionId conflicts on subsequent logins
    const session = await Session.findById(sessionId);
    if (session) {
      // Clean up any other sessions with the same userId and deviceIdHash
      await Session.deleteMany({
        userId: session.userId,
        deviceIdHash: session.deviceIdHash,
        _id: { $ne: session._id }, // Don't delete the session we're logging out
      });
    }
  }

  /**
   * Refresh token
   */
  static async refreshToken(
    userId: string,
    userType: SessionType,
    sessionId: string
  ): Promise<string> {
    const session = await Session.findById(sessionId);
    if (!session) {
      throw new AppError('Session not found', 401);
    }

    // Extend session
    const expiresAt = new Date();
    const hours = userType === SessionType.ADMIN ? 8 : 24;
    expiresAt.setHours(expiresAt.getHours() + hours);

    session.expiresAt = expiresAt;
    await session.save();

    // Generate new JWT
    const token = jwt.sign(
      {
        userId,
        userType,
        sessionId,
      },
      envConfig.JWT_SECRET,
      { expiresIn: `${hours}h` }
    );

    return token;
  }
}
