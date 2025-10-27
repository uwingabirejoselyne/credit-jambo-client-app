import React, { useState, useEffect } from 'react';
import { Card, Loading } from '../common';
// Using mock services for demo (replace with real API services when backend is ready)
import { getTransactionHistory, type Transaction } from '../../services/api/transactionService';
import { formatCurrency, formatDateTime, getRelativeTime } from '../../utils/formatters';
import toast from 'react-hot-toast';

/**
 * Transaction History component
 * Displays paginated list of user transactions
 */

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchTransactions = async (page: number) => {
    try {
      setIsLoading(true);
      const data = await getTransactionHistory(page, limit);
      setTransactions(data.transactions);
      setTotalPages(data.pagination.totalPages);
      setCurrentPage(page);
    } catch (error: any) {
      toast.error(error?.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(1);
  }, []);

  const getTransactionIcon = (type: string) => {
    if (type === 'deposit') {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-primary-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </div>
      );
    }
    return (
      <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-red-600 rounded-lg flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <Card title="Transaction History">
      {isLoading ? (
        <div className="py-12">
          <Loading size="md" text="Loading transactions..." />
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Transactions Yet</h3>
          <p className="text-gray-600">Start by making a deposit to your account</p>
        </div>
      ) : (
        <>
          {/* Transactions List */}
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-900 capitalize">
                        {transaction.type}
                      </h4>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {transaction.description || `${transaction.type} transaction`}
                    </p>
                    <p className="text-xs text-gray-500 mt-1" title={formatDateTime(transaction.createdAt)}>
                      {getRelativeTime(transaction.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {transaction.type === 'deposit' ? '+' : '-'}
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Balance: {formatCurrency(transaction.balance, transaction.currency)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => fetchTransactions(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => fetchTransactions(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
};
