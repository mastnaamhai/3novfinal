import { useState, useCallback, useEffect } from 'react';
import { validateField, validateForm, ValidationRules, ValidationErrors } from '../services/formValidation';

export interface UseFormValidationOptions {
  validationRules: ValidationRules;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

export interface UseFormValidationReturn {
  errors: ValidationErrors;
  isValid: boolean;
  validateField: (fieldName: string, value: any) => string | null;
  validateForm: (data: any) => ValidationErrors;
  setFieldError: (fieldName: string, error: string | null) => void;
  clearErrors: () => void;
  clearFieldError: (fieldName: string) => void;
  setErrors: (errors: ValidationErrors) => void;
}

export const useFormValidation = (options: UseFormValidationOptions): UseFormValidationReturn => {
  const {
    validationRules,
    validateOnChange = true,
    validateOnBlur = true,
    validateOnSubmit = true
  } = options;

  const [errors, setErrorsState] = useState<ValidationErrors>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Helper function to get nested value from object
  const getNestedValue = useCallback((obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
      if (current === null || current === undefined) return undefined;
      if (key.includes('[') && key.includes(']')) {
        // Handle array access like 'packages.0.description'
        const [arrayKey, indexStr] = key.split('[');
        const index = parseInt(indexStr.replace(']', ''), 10);
        return current[arrayKey]?.[index];
      }
      return current[key];
    }, obj);
  }, []);

  // Validate a single field
  const validateSingleField = useCallback((fieldName: string, value: any): string | null => {
    const fieldRules = validationRules[fieldName];
    if (!fieldRules) return null;
    
    return validateField(value, fieldRules);
  }, [validationRules]);

  // Validate entire form
  const validateEntireForm = useCallback((data: any): ValidationErrors => {
    return validateForm(data, validationRules);
  }, [validationRules]);

  // Set error for a specific field
  const setFieldError = useCallback((fieldName: string, error: string | null) => {
    setErrorsState(prev => {
      if (error) {
        return { ...prev, [fieldName]: error };
      } else {
        const { [fieldName]: removed, ...rest } = prev;
        return rest;
      }
    });
  }, []);

  // Clear all errors
  const clearErrors = useCallback(() => {
    setErrorsState({});
    setTouchedFields(new Set());
  }, []);

  // Clear error for a specific field
  const clearFieldError = useCallback((fieldName: string) => {
    setFieldError(fieldName, null);
  }, [setFieldError]);

  // Set multiple errors
  const setErrors = useCallback((newErrors: ValidationErrors) => {
    setErrorsState(newErrors);
  }, []);

  // Check if form is valid
  const isValid = Object.keys(errors).length === 0;

  // Handle field change with validation
  const handleFieldChange = useCallback((fieldName: string, value: any) => {
    if (validateOnChange && touchedFields.has(fieldName)) {
      const error = validateSingleField(fieldName, value);
      setFieldError(fieldName, error);
    }
  }, [validateOnChange, touchedFields, validateSingleField, setFieldError]);

  // Handle field blur with validation
  const handleFieldBlur = useCallback((fieldName: string, value: any) => {
    setTouchedFields(prev => new Set(prev).add(fieldName));
    
    if (validateOnBlur) {
      const error = validateSingleField(fieldName, value);
      setFieldError(fieldName, error);
    }
  }, [validateOnBlur, validateSingleField, setFieldError]);

  return {
    errors,
    isValid,
    validateField: validateSingleField,
    validateForm: validateEntireForm,
    setFieldError,
    clearErrors,
    clearFieldError,
    setErrors,
    // Internal handlers for form components
    handleFieldChange,
    handleFieldBlur
  };
};

// Hook for individual field validation with real-time feedback
export const useFieldValidation = (
  fieldName: string,
  value: any,
  validationRules: ValidationRules,
  options: { validateOnChange?: boolean; validateOnBlur?: boolean } = {}
) => {
  const { validateOnChange = true, validateOnBlur = true } = options;
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);

  const fieldRules = validationRules[fieldName];

  // Validate field value
  const validate = useCallback((val: any) => {
    if (!fieldRules) return null;
    return validateField(val, fieldRules);
  }, [fieldRules]);

  // Handle value change
  useEffect(() => {
    if (validateOnChange && touched) {
      const newError = validate(value);
      setError(newError);
    }
  }, [value, validateOnChange, touched, validate]);

  // Handle field blur
  const handleBlur = useCallback(() => {
    setTouched(true);
    if (validateOnBlur) {
      const newError = validate(value);
      setError(newError);
    }
  }, [validateOnBlur, validate, value]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    touched,
    validate,
    handleBlur,
    clearError
  };
};
