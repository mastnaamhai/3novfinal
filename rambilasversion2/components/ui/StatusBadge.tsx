import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusVariants = {
  default: 'bg-gray-100 text-gray-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  neutral: 'bg-gray-100 text-gray-600',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
  lg: 'px-3 py-1.5 text-base',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${statusVariants[variant]} ${sizeClasses[size]} ${className}`}
    >
      {status}
    </span>
  );
};

// Predefined status mappings for common statuses
export const getStatusVariant = (status: string): StatusBadgeProps['variant'] => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('paid') || statusLower.includes('completed') || statusLower.includes('delivered')) {
    return 'success';
  }
  if (statusLower.includes('pending') || statusLower.includes('partially') || statusLower.includes('transit')) {
    return 'warning';
  }
  if (statusLower.includes('unpaid') || statusLower.includes('cancelled') || statusLower.includes('failed')) {
    return 'danger';
  }
  if (statusLower.includes('created') || statusLower.includes('invoiced')) {
    return 'info';
  }
  
  return 'neutral';
};
