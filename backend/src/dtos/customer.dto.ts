import { ICustomer, IDevice } from '../models/customer.model';

/**
 * DTO for customer registration
 */
export interface RegisterCustomerDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  deviceId: string;
}

/**
 * DTO for customer login
 */
export interface LoginCustomerDto {
  email: string;
  password: string;
  deviceId: string;
}

/**
 * DTO for device information (sanitized)
 */
export interface DeviceDto {
  deviceId: string;
  isVerified: boolean;
  verifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
}

/**
 * DTO for customer response (sanitized - no sensitive data)
 */
export interface CustomerResponseDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  balance: number;
  isActive: boolean;
  devices: DeviceDto[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

/**
 * DTO for authentication response
 */
export interface AuthResponseDto {
  customer: CustomerResponseDto;
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

/**
 * DTO for customer profile (limited info)
 */
export interface CustomerProfileDto {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}

/**
 * DTO for balance response
 */
export interface BalanceResponseDto {
  balance: number;
  currency: string;
  lastUpdated: string;
}

/**
 * Transform customer model to response DTO
 */
export class CustomerDtoMapper {
  static toResponseDto(customer: ICustomer): CustomerResponseDto {
    return {
      id: (customer._id as any).toString(),
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      balance: customer.balance,
      isActive: customer.isActive,
      devices: customer.devices.map(this.toDeviceDto),
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
      lastLoginAt: customer.lastLoginAt?.toISOString(),
    };
  }

  static toProfileDto(customer: ICustomer): CustomerProfileDto {
    return {
      id: (customer._id as any).toString(),
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: `${customer.firstName} ${customer.lastName}`,
      email: customer.email,
      phone: customer.phone,
      createdAt: customer.createdAt.toISOString(),
    };
  }

  static toDeviceDto(device: IDevice): DeviceDto {
    return {
      deviceId: device.deviceId,
      isVerified: device.isVerified,
      verifiedAt: device.verifiedAt?.toISOString(),
      lastLoginAt: device.lastLoginAt?.toISOString(),
      createdAt: device.createdAt.toISOString(),
    };
  }

  static toBalanceDto(customer: ICustomer): BalanceResponseDto {
    return {
      balance: customer.balance,
      currency: 'RWF', // Rwandan Franc
      lastUpdated: customer.updatedAt.toISOString(),
    };
  }
}
