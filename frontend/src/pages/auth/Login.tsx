import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { Input, Button } from '../../components/common';
import { getDeviceId } from '../../utils/deviceFingerprint';
import { validateEmail } from '../../utils/validators';
import { sanitizeEmail } from '../../utils/sanitizer';

/**
 * Login page component
 * Handles user authentication with device verification
 */

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, user, isAuthenticated } = useAuth();
  const hasRedirected = useRef(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState<string>('');
  const [showDeviceWarning, setShowDeviceWarning] = useState(false);

  // Get device ID on component mount
  useEffect(() => {
    const fetchDeviceId = async () => {
      const id = await getDeviceId();
      setDeviceId(id);
    };
    fetchDeviceId();
  }, []);

  // Redirect to dashboard if already authenticated - only once
  useEffect(() => {
    if (isAuthenticated && user?.deviceVerified && !hasRedirected.current) {
      hasRedirected.current = true;
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  
  // Prevent scrolling when on login page

   useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Sanitize email input
    const sanitizedValue = name === 'email' ? sanitizeEmail(value) : value;

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

    // Validate email
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      newErrors.email = emailValidation.error!;
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      setShowDeviceWarning(false);

      await login({
        email: formData.email,
        password: formData.password,
        deviceId: deviceId,
      });

      // Navigation will be handled by the useEffect above after login updates user state
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific error cases
      if (error?.message?.includes('device')) {
        setShowDeviceWarning(true);
      }
      setIsLoading(false);
    }
  };

  // Don't render login form if already authenticated and redirecting
  if (isAuthenticated && user?.deviceVerified) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-1/3 -left-40 w-96 h-96 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-accent-200 rounded-full opacity-20 blur-3xl"></div>
      </div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mt-1 mb-1">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-600  rounded-2xl mb-4 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-green-600 mb-1">Credit Jambo</h1>
          <p className="text-gray-600 text-lg">Welcome Back!</p>
        </div>

        <div className="card">
          {showDeviceWarning && (
            <div className="bg-gradient-to-r from-accent-50 to-red-50 border-l-4 border-accent-600 p-4 rounded-lg mb-3">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-accent-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-accent-900 font-semibold">Device Verification Required</p>
                  <p className="text-sm text-accent-800 mt-1">Your device needs admin verification. Please contact support.</p>
                </div>
              </div>
            </div>
          )}

          {!deviceId && (
            <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border-l-4 border-primary-500 p-4 rounded-lg mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-primary-600 mr-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm text-primary-800 font-medium">Securing your device fingerprint...</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="demo@creditjambo.com"
              autoComplete="email"
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
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="text-black hover:text-green-600 font-medium transition-colors">
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
              disabled={!deviceId}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-green-600 hover:text-primary-700 font-semibold transition-colors">
                Create Account
              </Link>
            </p>
          </div>

          {/* Security Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="bg-gradient-to-r from-secondary-50 to-primary-50 border-l-4 border-green-500 p-2 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-green-800">
                  Only verified devices can access accounts. New devices must be approved by an administrator.
                </p>
              </div>
            </div>

            {/* Security Features */}
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-primary-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Encrypted</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-black mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Verified</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-accent-600 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2H7V7a3 3 0 015.905-.75 1 1 0 001.937-.5A5.002 5.002 0 0010 2z" />
                  </svg>
                  <span>Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
