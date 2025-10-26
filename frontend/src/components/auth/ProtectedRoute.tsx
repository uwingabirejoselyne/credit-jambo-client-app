import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../store/contexts/AuthContext';
import { Loading } from '../common';

/**
 * Protected Route component
 * Restricts access to authenticated users only
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loading fullScreen text="Loading..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
