/**
 * Input sanitization utilities
 * These functions clean and sanitize user input to prevent XSS and injection attacks
 */

/**
 * Sanitize string input by removing HTML tags and dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (!input) return '';

  return input
    .replace(/[<>]/g, '') // Remove < and > to prevent HTML injection
    .replace(/['"]/g, '') // Remove quotes to prevent SQL injection attempts
    .trim();
};

/**
 * Sanitize email input
 */
export const sanitizeEmail = (email: string): string => {
  if (!email) return '';

  return email
    .toLowerCase()
    .replace(/[^\w@.-]/g, '') // Only allow word characters, @, ., and -
    .trim();
};

/**
 * Sanitize phone number (keep only digits and +)
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone) return '';

  return phone.replace(/[^\d+]/g, '');
};

/**
 * Sanitize numeric input (for amounts)
 */
export const sanitizeAmount = (amount: string): string => {
  if (!amount) return '';

  // Keep only digits and decimal point
  return amount.replace(/[^\d.]/g, '');
};

/**
 * Sanitize name (keep only letters, spaces, hyphens, apostrophes)
 */
export const sanitizeName = (name: string): string => {
  if (!name) return '';

  return name
    .replace(/[^a-zA-Z\s'-]/g, '')
    .trim();
};

/**
 * Escape HTML to prevent XSS
 */
export const escapeHtml = (text: string): string => {
  if (!text) return '';

  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (char) => map[char]);
};

/**
 * Sanitize object by applying appropriate sanitization to each field
 */
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Apply appropriate sanitization based on field name
      if (key.toLowerCase().includes('email')) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.toLowerCase().includes('phone')) {
        sanitized[key] = sanitizePhone(value);
      } else if (key.toLowerCase().includes('amount') || key.toLowerCase().includes('balance')) {
        sanitized[key] = sanitizeAmount(value);
      } else if (key.toLowerCase().includes('name')) {
        sanitized[key] = sanitizeName(value);
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};
