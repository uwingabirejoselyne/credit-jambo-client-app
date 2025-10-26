import React, { useState, type FormEvent } from 'react';
import { Input, Button } from '../common';
// Using mock services for demo (replace with real API services when backend is ready)
import { withdraw } from '../../services/mock/transactionService.mock';
import { validateWithdrawal } from '../../utils/validators';
import { sanitizeAmount } from '../../utils/sanitizer';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Withdraw modal component
 * Allows users to withdraw funds from their account
 */

interface WithdrawModalProps {
  onClose: () => void;
  onSuccess: () => void;
  currentBalance: number;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  onClose,
  onSuccess,
  currentBalance,
}) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    const sanitizedValue = name === 'amount' ? sanitizeAmount(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: sanitizedValue,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const amountValidation = validateWithdrawal(formData.amount, currentBalance);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error!;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);

      await withdraw({
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
      });

      toast.success(`Successfully withdrew ${formData.amount}!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Withdrawal failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-accent-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Make a Withdrawal</h2>
          <p className="text-gray-600 mt-1">Take out funds from your account</p>
        </div>

        {/* Available Balance */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-gray-600 mb-1">Available Balance</p>
          <p className="text-2xl font-bold text-gray-900">{formatCurrency(currentBalance)}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Amount"
            name="amount"
            type="text"
            value={formData.amount}
            onChange={handleChange}
            error={errors.amount}
            required
            placeholder="5000"
            helperText={`Maximum: ${formatCurrency(currentBalance)}`}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 hover:border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all duration-200 bg-white resize-none"
              rows={3}
              placeholder="What is this withdrawal for?"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              fullWidth
              isLoading={isLoading}
            >
              Withdraw
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
