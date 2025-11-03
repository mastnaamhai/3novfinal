import React from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
  options?: SelectOption[];
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  id, 
  error, 
  wrapperClassName, 
  className, 
  children, 
  options,
  ...props 
}) => {
  const selectId = id || `select-${(label || '').replace(/\s+/g, '-')}`;
  
  const errorClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-indigo-600 focus:ring-indigo-600';

  const hasValue = props.value !== undefined && props.value !== null && props.value !== '' && props.value !== 0;

  return (
    <div className={`relative ${wrapperClassName}`}>
      <select
        id={selectId}
        className={`peer block w-full rounded-lg shadow-sm appearance-none py-3 px-3 bg-white border ${errorClasses} focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 text-base text-gray-900 ${error ? 'animate-shake' : ''} ${className || ''}`}
        {...props}
      >
        {options ? (
          <>
            <option value="" disabled>Select {label}</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </>
        ) : (
          children
        )}
      </select>
      {label && (
        <label
          htmlFor={selectId}
          className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-focus:px-2 peer-focus:text-indigo-600 ${error ? 'peer-focus:text-red-600 text-red-600' : ''} ${!hasValue ? 'peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2' : ''} peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4`}
        >
          {label}
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
