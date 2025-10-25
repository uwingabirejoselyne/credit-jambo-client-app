import React, { type ReactNode } from 'react';

/**
 * Reusable Card component for consistent layouts
 */

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  noPadding = false,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${!noPadding ? 'p-6' : ''} ${className}`}>
      {title && <h2 className="text-xl font-semibold text-gray-800 mb-4">{title}</h2>}
      {children}
    </div>
  );
};
