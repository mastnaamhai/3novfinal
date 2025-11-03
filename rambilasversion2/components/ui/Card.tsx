import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className, titleClassName, ...props }) => {
  return (
    <div className={`bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 ${className}`} {...props}>
      {title && <h3 className={`text-lg sm:text-xl font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-3 ${titleClassName}`}>{title}</h3>}
      {children}
    </div>
  );
};
