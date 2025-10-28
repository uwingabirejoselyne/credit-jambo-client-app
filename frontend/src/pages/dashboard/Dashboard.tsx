import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/contexts/AuthContext';
import { useAccount } from '../../store/contexts/AccountContext';
import { Navbar } from '../../components/common/Navbar';
import { Card, Loading, Alert } from '../../components/common';
import { formatCurrency } from '../../utils/formatters';
import { DepositModal } from '../../components/transactions/DepositModal';
import { WithdrawModal } from '../../components/transactions/WithdrawModal';
import { TransactionHistory } from '../../components/transactions/TransactionHistory';

/**
 * Dashboard page component
 * Main page after login - shows balance, allows transactions, displays history
 */

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { balance, currency, isLoading, refreshBalance } = useAccount();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showLowBalanceAlert, setShowLowBalanceAlert] = useState(false);

  // Check for low balance
  useEffect(() => {
    if (balance > 0 && balance < 10000) {
      setShowLowBalanceAlert(true);
    } else {
      setShowLowBalanceAlert(false);
    }
  }, [balance]);

  if (!user?.deviceVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Alert
            type="warning"
            message="Your device is not verified yet. Please wait for admin approval to access your account."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section with Refresh Button */}
        <div className="mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Welcome back, <span className="gradient-text">{user?.fullName?.split(' ')[0]}</span>! 👋
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Manage your savings and track your transactions</p>
            </div>
            <button
              onClick={refreshBalance}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
              disabled={isLoading}
            >
              <svg className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="text-sm font-medium text-gray-700">Refresh</span>
            </button>
          </div>
        </div>

        {/* Low Balance Alert */}
        {showLowBalanceAlert && (
          <div className="mb-6 animate-fadeIn">
            <Alert
              type="warning"
              message={`Your balance is low (${formatCurrency(balance, currency)}). Consider making a deposit.`}
              onClose={() => setShowLowBalanceAlert(false)}
            />
          </div>
        )}

        {/* Balance Card & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-2xl shadow-2xl p-8 text-white relative overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
              {/* Animated Decorative circles */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-white opacity-10 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white opacity-10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white opacity-5 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-sm text-primary-100 mb-2 font-medium flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                      </svg>
                      Total Balance
                    </p>
                    <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
                      {isLoading ? (
                        <span className="animate-pulse">---</span>
                      ) : (
                        formatCurrency(balance, currency)
                      )}
                    </h2>
                  </div>
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center backdrop-blur-sm transform transition-transform duration-300 hover:scale-110 hover:rotate-6">
                    <svg className="w-8 h-8 md:w-10 md:h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm border-t border-white border-opacity-20 pt-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-primary-100">Last updated: Just now</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-primary-100">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <button
                onClick={() => setShowDepositModal(true)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-200">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Deposit</h3>
                      <p className="text-sm text-gray-500">Add funds to wallet</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </Card>

            <Card className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
              <button
                onClick={() => setShowWithdrawModal(true)}
                className="w-full text-left group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-200">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">Withdraw</h3>
                      <p className="text-sm text-gray-500">Take out funds</p>
                    </div>
                  </div>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </Card>
          </div>
        </div>

        {/* Transaction History */}
        <TransactionHistory />
      </div>

      {/* Modals */}
      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          onSuccess={refreshBalance}
        />
      )}

      {showWithdrawModal && (
        <WithdrawModal
          onClose={() => setShowWithdrawModal(false)}
          onSuccess={refreshBalance}
          currentBalance={balance}
        />
      )}
    </div>
  );
};
