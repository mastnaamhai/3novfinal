import React from 'react';

interface ResponsiveFormProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
}

export const ResponsiveForm: React.FC<ResponsiveFormProps> = ({ 
  children, 
  title, 
  subtitle, 
  className = '' 
}) => {
  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      {(title || subtitle) && (
        <div className="mb-6 sm:mb-8">
          {title && (
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-sm sm:text-base text-gray-600">
              {subtitle}
            </p>
          )}
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

interface FormSectionProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ 
  children, 
  title, 
  className = '' 
}) => {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {title && (
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-200">
          {title}
        </h2>
      )}
      <div className="space-y-4 sm:space-y-6">
        {children}
      </div>
    </div>
  );
};

interface FormRowProps {
  children: React.ReactNode;
  className?: string;
}

export const FormRow: React.FC<FormRowProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 ${className}`}>
      {children}
    </div>
  );
};

interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
};
