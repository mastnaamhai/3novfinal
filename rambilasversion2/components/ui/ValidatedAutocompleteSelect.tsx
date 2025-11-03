import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useFieldValidation } from '../../hooks/useFormValidation';
import { ValidationRules } from '../../services/formValidation';
import { Customer } from '../../types';
import { fetchGstDetails } from '../../services/simpleGstService';

interface ValidatedAutocompleteSelectProps {
  label?: string;
  validationRules: ValidationRules;
  fieldName: string;
  value: string;
  onValueChange: (value: string) => void;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  wrapperClassName?: string;
  showValidationIcon?: boolean;
  customers: Customer[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  onSaveCustomer?: (customer: Omit<Customer, '_id'>) => Promise<Customer>;
  onSelect?: (customer: Customer) => void;
}

export const ValidatedAutocompleteSelect: React.FC<ValidatedAutocompleteSelectProps> = ({
  label,
  validationRules,
  fieldName,
  value,
  onValueChange,
  validateOnChange = true,
  validateOnBlur = true,
  wrapperClassName,
  showValidationIcon = true,
  customers,
  placeholder = "Type to search customers...",
  disabled = false,
  required = false,
  className = '',
  onSaveCustomer,
  onSelect,
  ...props
}) => {
  const { error, touched, handleBlur, clearError } = useFieldValidation(
    fieldName,
    value,
    validationRules,
    { validateOnChange, validateOnBlur }
  );

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isVerifyingGst, setIsVerifyingGst] = useState(false);
  const [gstVerificationResult, setGstVerificationResult] = useState<{ success: boolean; data?: Omit<Customer, '_id'>; error?: string } | null>(null);
  const [showCreateNew, setShowCreateNew] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Find the selected customer
  const selectedCustomer = useMemo(() => {
    return customers.find(customer => customer._id === value);
  }, [customers, value]);

  // Filter customers based on search term with close matches
  const { exactMatches, closeMatches, filteredCustomers } = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return { exactMatches: [], closeMatches: [], filteredCustomers: [] };
    
    const lowercaseSearch = searchTerm.toLowerCase();
    const uppercaseSearch = searchTerm.toUpperCase();
    
    const allMatches = customers.filter(customer => 
      customer.name.toLowerCase().includes(lowercaseSearch) ||
      (customer.gstin && (customer.gstin.toLowerCase().includes(lowercaseSearch) || customer.gstin.includes(uppercaseSearch))) ||
      (customer.tradeName && customer.tradeName.toLowerCase().includes(lowercaseSearch))
    );

    // Separate exact matches from close matches
    const exact = allMatches.filter(customer => 
      customer.name.toLowerCase().startsWith(lowercaseSearch) ||
      (customer.gstin && customer.gstin.includes(uppercaseSearch))
    );
    
    const close = allMatches.filter(customer => 
      !customer.name.toLowerCase().startsWith(lowercaseSearch) &&
      (!customer.gstin || !customer.gstin.includes(uppercaseSearch))
    );

    const combined = [...exact.slice(0, 5), ...close.slice(0, 3)];

    return {
      exactMatches: exact.slice(0, 5),
      closeMatches: close.slice(0, 3),
      filteredCustomers: combined
    };
  }, [customers, searchTerm]);

  // Update search term when value changes externally
  useEffect(() => {
    if (selectedCustomer && !isFocused) {
      setSearchTerm(selectedCustomer.name);
    } else if (!value && !isFocused) {
      setSearchTerm('');
    }
  }, [selectedCustomer, value, isFocused]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(-1);
        if (selectedCustomer) {
          setSearchTerm(selectedCustomer.name);
        } else {
          setSearchTerm('');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCustomer]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredCustomers.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredCustomers.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredCustomers.length) {
          handleCustomerSelect(filteredCustomers[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setIsOpen(newSearchTerm.length >= 2);
    setHighlightedIndex(-1);
    setGstVerificationResult(null);
    setShowCreateNew(newSearchTerm.length >= 2);
    
    // Clear selection if search term doesn't match selected customer
    if (selectedCustomer && !selectedCustomer.name.toLowerCase().includes(newSearchTerm.toLowerCase())) {
      onValueChange('');
    }
  };

  // Handle GST verification - Database-first approach
  const handleVerifyGst = async () => {
    if (!searchTerm || searchTerm.length !== 15) {
      setGstVerificationResult({
        success: false,
        error: 'Please enter a valid 15-digit GSTIN.'
      });
      return;
    }

    setIsVerifyingGst(true);
    setGstVerificationResult(null);

    try {
      // STEP 1: Check database first (FREE)
      const normalizedGstin = searchTerm.toUpperCase();
      const existingCustomer = customers.find((c: Customer) => 
        c.gstin && c.gstin.toUpperCase() === normalizedGstin
      );
      
      if (existingCustomer) {
        // Customer exists in database - use it immediately (NO API CALL)
        setGstVerificationResult({
          success: true,
          data: existingCustomer,
          message: 'Customer found in database'
        });
        return;
      }

      // STEP 2: Customer not in database - fetch from API (COST MONEY)
      console.log('Customer not found in database, fetching from GST API...');
      const result = await fetchGstDetails(searchTerm);
      setGstVerificationResult(result);
    } catch (error) {
      setGstVerificationResult({
        success: false,
        error: 'Failed to verify GSTIN. Please try again.'
      });
    } finally {
      setIsVerifyingGst(false);
    }
  };

  // Handle creating new customer from GST data
  const handleCreateFromGst = async () => {
    if (gstVerificationResult?.success && gstVerificationResult.data && onSaveCustomer) {
      try {
        const newCustomer = await onSaveCustomer(gstVerificationResult.data);
        onValueChange(newCustomer._id);
        setSearchTerm(newCustomer.name);
        setIsOpen(false);
        setGstVerificationResult(null);
        if (onSelect) {
          onSelect(newCustomer);
        }
      } catch (error) {
        console.error('Failed to save customer:', error);
      }
    }
  };

  const handleInputFocus = () => {
    setIsFocused(true);
    if (searchTerm.length >= 2) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    handleBlur();
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    onValueChange(customer._id);
    setSearchTerm(customer.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    setGstVerificationResult(null);
    inputRef.current?.focus();
    if (onSelect) {
      onSelect(customer);
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

  const getDisplayValue = () => {
    if (selectedCustomer) {
      return selectedCustomer.name;
    }
    return searchTerm;
  };

  return (
    <div className={`relative ${wrapperClassName}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`peer block w-full rounded-lg shadow-sm py-3 px-3 bg-white border transition-colors duration-200 text-base text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-0 ${
            hasError 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500 animate-shake' 
              : 'border-gray-300 focus:border-indigo-600 focus:ring-indigo-600'
          } ${isPending ? 'ring-2 ring-blue-200' : ''} ${
            isValid ? 'border-green-500 focus:border-green-500 focus:ring-green-500' : ''
          } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''} ${className}`}
          {...props}
        />
        
        {label && (
          <label
            className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 left-1 peer-focus:px-2 peer-focus:text-indigo-600 ${
              hasError ? 'peer-focus:text-red-600 text-red-600' : ''
            } ${
              !getDisplayValue() ? 'peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2' : ''
            } peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4`}
          >
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        {getValidationIcon()}
      </div>

      {isOpen && (exactMatches.length > 0 || closeMatches.length > 0 || showCreateNew) && (
        <ul
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-auto"
        >
          {/* Exact Matches */}
          {exactMatches.length > 0 && (
            <>
              <li className="px-4 py-2 bg-gray-100 text-sm font-medium text-gray-700 border-b">
                Exact Matches
              </li>
              {exactMatches.map((customer, index) => (
                <li
                  key={customer._id}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    index === highlightedIndex ? 'bg-blue-50' : ''
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCustomerSelect(customer);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  {customer.tradeName && (
                    <div className="text-sm text-gray-600">{customer.tradeName}</div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {customer.gstin && <span>GST: {customer.gstin}</span>}
                    {customer.state && <span>{customer.state}</span>}
                    {customer.contactPhone && <span>{customer.contactPhone}</span>}
                  </div>
                </li>
              ))}
            </>
          )}

          {/* Close Matches */}
          {closeMatches.length > 0 && (
            <>
              <li className="px-4 py-2 bg-gray-50 text-sm font-medium text-gray-600 border-b">
                Close Matches
              </li>
              {closeMatches.map((customer, index) => (
                <li
                  key={customer._id}
                  className={`px-4 py-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${
                    (exactMatches.length + index) === highlightedIndex ? 'bg-blue-50' : ''
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleCustomerSelect(customer);
                  }}
                  onMouseEnter={() => setHighlightedIndex(exactMatches.length + index)}
                >
                  <div className="font-medium text-gray-900">{customer.name}</div>
                  {customer.tradeName && (
                    <div className="text-sm text-gray-600">{customer.tradeName}</div>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {customer.gstin && <span>GST: {customer.gstin}</span>}
                    {customer.state && <span>{customer.state}</span>}
                  </div>
                </li>
              ))}
            </>
          )}

          {/* Create New Customer Section */}
          {showCreateNew && (
            <>
              <li className="px-4 py-2 bg-blue-50 text-sm font-medium text-blue-700 border-b">
                Create New Customer
              </li>
              
              {/* GST Verification */}
              {searchTerm.length === 15 && (
                <li className="px-4 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleVerifyGst}
                      disabled={isVerifyingGst}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isVerifyingGst ? 'Verifying...' : 'Fetch GST Details'}
                    </button>
                    <span className="text-sm text-gray-600">
                      Verify GSTIN: {searchTerm}
                    </span>
                  </div>
                  
                  {/* GST Verification Result */}
                  {gstVerificationResult && (
                    <div className="mt-2 p-2 rounded text-sm">
                      {gstVerificationResult.success ? (
                        <div className="bg-green-50 border border-green-200 rounded p-2">
                          <div className="text-green-800 font-medium">GST Details Found</div>
                          <div className="text-green-700 text-xs mt-1">
                            {gstVerificationResult.data?.name} - {gstVerificationResult.data?.state}
                          </div>
                          {onSaveCustomer && (
                            <button
                              type="button"
                              onClick={handleCreateFromGst}
                              className="mt-2 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                            >
                              Create & Select Customer
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="bg-red-50 border border-red-200 rounded p-2">
                          <div className="text-red-800 text-xs">
                            {gstVerificationResult.error}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              )}
              
              {/* Manual Entry Option */}
              <li className="px-4 py-3 cursor-pointer hover:bg-gray-50">
                <div className="text-sm text-gray-600">
                  Enter customer details manually: "{searchTerm}"
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Click to create new customer with this name
                </div>
              </li>
            </>
          )}
        </ul>
      )}

      {isOpen && searchTerm.length >= 2 && exactMatches.length === 0 && closeMatches.length === 0 && !showCreateNew && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3 text-sm text-gray-500">
          No customers found matching "{searchTerm}"
        </div>
      )}

      {hasError && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};
