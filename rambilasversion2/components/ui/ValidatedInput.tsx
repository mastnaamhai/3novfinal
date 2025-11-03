import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { useFieldValidation } from '../../hooks/useFormValidation';
import { ValidationRules } from '../../services/formValidation';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  validationRules: ValidationRules;
  fieldName: string;
  value: any;
  onValueChange: (value: any) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  wrapperClassName?: string;
  icon?: React.ReactElement<{ className?: string }>;
  showValidationIcon?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  validationRules,
  fieldName,
  value,
  onValueChange,
  validateOnChange = true,
  validateOnBlur = true,
  wrapperClassName,
  icon,
  showValidationIcon = true,
  ...props
}) => {
  const { error, touched, handleBlur, clearError } = useFieldValidation(
    fieldName,
    value,
    validationRules,
    { validateOnChange, validateOnBlur }
  );

  const [isFocused, setIsFocused] = useState(false);

  // Clear error when value changes and field is not touched
  useEffect(() => {
    if (!touched && error) {
      clearError();
    }
  }, [value, touched, error, clearError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onValueChange(newValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlurEvent = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    handleBlur();
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  // Determine validation state
  const hasError = touched && error;
  const isValid = touched && !error && value !== '' && value !== null && value !== undefined;
  const isPending = isFocused && !touched;

  // Get validation icon
  const getValidationIcon = () => {
    if (!showValidationIcon || !touched) return null;
    
    if (hasError) {
      return (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    if (isValid) {
      return (
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`relative ${wrapperClassName}`}>
      <Input
        {...props}
        label={label}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlurEvent}
        error={hasError ? error : undefined}
        icon={icon}
        className={`${props.className || ''} ${isPending ? 'ring-2 ring-blue-200' : ''} ${isValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''}`}
      />
      {getValidationIcon()}
    </div>
  );
};
