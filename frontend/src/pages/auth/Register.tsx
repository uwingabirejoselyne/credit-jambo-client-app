import React, { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { Input, Button, Card, Alert } from '../../components/common';
import { getDeviceId } from '../../utils/deviceFingerprint';
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateFullName,
} from '../../utils/validators';
import {
  sanitizeEmail,
  sanitizePhone,
  sanitizeName,
} from '../../utils/sanitizer';

/**
 * Registration page component
 * Captures user details and device fingerprint for admin verification
 */

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');

  // Get device ID on component mount
  React.useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
    };
    fetchDeviceId();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Sanitize input based on field
    let sanitizedValue = value;
    if (name === 'email') sanitizedValue = sanitizeEmail(value);
    if (name === 'phone') sanitizedValue = sanitizePhone(value);
    if (name === 'fullName') sanitizedValue = sanitizeName(value);

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate full name
    const nameValidation = validateFullName(formData.fullName);
    if (!nameValidation.isValid) {
      newErrors.fullName = nameValidation.error!;
    }

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }

    // Validate phone
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      newErrors.phone = phoneValidation.error!;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.error!;
    }

    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      await register({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        deviceId: deviceId,
      });

      // Navigate to login page after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Credit Jambo</h1>
          <p className="mt-2 text-gray-600">Create your savings account</p>
        </div>

        <Card>
          {!deviceId && (
            <Alert
              type="info"
              message="Generating device fingerprint for security..."
            />
          )}

          <form onSubmit={handleSubmit} className="mt-4">
            <Input
              label="Full Name"
              name="fullName"
              type="text"
              value={formData.fullName}
              onChange={handleChange}
              error={errors.fullName}
              required
              placeholder="John Doe"
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="john.doe@example.com"
            />

            <Input
              label="Phone Number"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              required
              placeholder="+250788268451"
              helperText="Include country code (e.g., +250)"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              required
              placeholder="••••••••"
              helperText="Min 8 chars, uppercase, lowercase, number, special char"
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              required
              placeholder="••••••••"
            />

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
              <p className="text-sm text-yellow-800">
                Your device will need to be verified by an administrator before you can
                access your account.
              </p>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={!deviceId}
            >
              Register
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
