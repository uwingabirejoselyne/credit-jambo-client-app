import React, { useState, type FormEvent } from 'react';
import { Input, Button } from '../common';
import { deposit } from '../../services/api/transactionService';
import { validateAmount } from '../../utils/validators';
import { sanitizeAmount } from '../../utils/sanitizer';
import toast from 'react-hot-toast';

/**
 * Deposit modal component
 * Allows users to add funds to their account
 */

interface DepositModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ onClose, onSuccess }) => {
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

    const amountValidation = validateAmount(formData.amount);
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

      await deposit({
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
      });

      toast.success(`Successfully deposited ${formData.amount}!`);
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || 'Deposit failed. Please try again.';
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
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Make a Deposit</h2>
          <p className="text-gray-600 mt-1">Add funds to your savings account</p>
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
            placeholder="10000"
            helperText="Enter the amount you want to deposit"
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
              placeholder="What is this deposit for?"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="danger"
              fullWidth
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              isLoading={isLoading}
            >
              Deposit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
