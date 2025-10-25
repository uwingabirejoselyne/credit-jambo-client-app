/**
 * Input validation utilities
 * These functions validate user input before sending to the backend
 */

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate email format
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' };
  }

  return { isValid: true };
};

/**
 * Validate password strength
 * Requirements: min 8 characters, at least one uppercase, one lowercase, one number, one special char
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password || password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!/[0-9]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character' };
  }

  return { isValid: true };
};

/**
 * Validate phone number (basic international format)
 */
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  // Remove spaces, dashes, and parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');

  // Check if it starts with + and has 10-15 digits
  const phoneRegex = /^\+?[1-9]\d{9,14}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { isValid: false, error: 'Invalid phone number format (e.g., +250788268451)' };
  }

  return { isValid: true };
};

/**
 * Validate full name
 */
export const validateFullName = (name: string): ValidationResult => {
  if (!name || name.trim() === '') {
    return { isValid: false, error: 'Full name is required' };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: 'Name must be at least 2 characters long' };
  }

  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, error: 'Name can only contain letters, spaces, hyphens, and apostrophes' };
  }

  return { isValid: true };
};

/**
 * Validate amount for transactions
 */
export const validateAmount = (amount: string | number): ValidationResult => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return { isValid: false, error: 'Amount must be a valid number' };
  }

  if (numAmount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }

  if (numAmount > 1000000000) {
    return { isValid: false, error: 'Amount is too large' };
  }

  // Check for max 2 decimal places
  if (!/^\d+(\.\d{1,2})?$/.test(amount.toString())) {
    return { isValid: false, error: 'Amount can have at most 2 decimal places' };
  }

  return { isValid: true };
};

/**
 * Validate withdrawal amount against balance
 */
export const validateWithdrawal = (amount: string | number, balance: number): ValidationResult => {
  const amountValidation = validateAmount(amount);
  if (!amountValidation.isValid) {
    return amountValidation;
  }

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (numAmount > balance) {
    return { isValid: false, error: 'Insufficient balance' };
  }

  return { isValid: true };
};
