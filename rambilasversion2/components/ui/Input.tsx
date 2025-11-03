import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  wrapperClassName?: string;
  // Fix: Specify that the icon prop is a ReactElement that accepts a className, which resolves the cloneElement type error.
  icon?: React.ReactElement<{ className?: string }>;
}

export const Input = ({ label, id, type = 'text', error, helperText, wrapperClassName, icon, className, ...props }: InputProps) => {
  const inputId = id || `input-${(label || '').replace(/\s+/g, '-')}`;
  
  const errorClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-indigo-600 focus:ring-indigo-600';
  const iconPadding = icon ? 'pl-10' : 'pl-3';
  const isDate = type === 'date';

  return (
    <div className={`relative ${wrapperClassName}`}>
      {icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          {/* FIX: Use React.isValidElement as a type guard to ensure `icon` is a clonable element. */}
          {React.isValidElement(icon) && React.cloneElement(icon, { className: 'h-5 w-5 text-gray-400' })}
        </div>
      )}
      <input
        id={inputId}
        type={type}
        className={`peer block w-full rounded-lg shadow-sm appearance-none py-3 pr-3 ${iconPadding} bg-white border ${errorClasses} focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 text-base text-gray-900 placeholder-gray-400 ${error ? 'animate-shake' : ''} ${className || ''}`}
        placeholder=" " 
        {...props}
      />
      {label && (
        <label
          htmlFor={inputId}
          className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-focus:px-2 peer-focus:text-indigo-600 ${error ? 'peer-focus:text-red-600 text-red-600' : ''} ${!isDate ? 'peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2' : ''} peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4`}
        >
          {label}
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-gray-500">{helperText}</p>}
    </div>
  );
};
