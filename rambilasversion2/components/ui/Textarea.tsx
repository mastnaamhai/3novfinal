import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  wrapperClassName?: string;
}

export const Textarea: React.FC<TextareaProps> = ({ label, id, error, wrapperClassName, className, ...props }) => {
  const textareaId = id || `textarea-${(label || '').replace(/\s+/g, '-')}`;
  
  const errorClasses = error 
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
    : 'border-gray-300 focus:border-indigo-600 focus:ring-indigo-600';

  return (
    <div className={`relative ${wrapperClassName}`}>
      <textarea
        id={textareaId}
        className={`peer block w-full rounded-lg shadow-sm appearance-none py-3 px-3 bg-white border ${errorClasses} focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors duration-200 text-base text-gray-900 placeholder-gray-400 resize-none ${error ? 'animate-shake' : ''} ${className || ''}`}
        placeholder=" "
        {...props}
      />
      {label && (
        <label
          htmlFor={textareaId}
          className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-focus:px-2 peer-focus:text-indigo-600 ${error ? 'peer-focus:text-red-600 text-red-600' : ''} peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4`}
        >
          {label}
        </label>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
