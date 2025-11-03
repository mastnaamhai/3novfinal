import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchPincodeDetails, searchPincodes, validatePincode, type PincodeDetails } from '../../services/pincodeService';

interface PincodeInputProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPincodeFound?: (details: PincodeDetails) => void;
    onPincodeNotFound?: () => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
    disabled?: boolean;
    helpText?: string;
}

export const PincodeInput: React.FC<PincodeInputProps> = ({
    label,
    name,
    value,
    onChange,
    onPincodeFound,
    onPincodeNotFound,
    placeholder = "Enter 6-digit pincode",
    required = false,
    error,
    className = '',
    disabled = false,
    helpText
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<PincodeDetails[]>([]);
    const [lastFetchedPincode, setLastFetchedPincode] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Debounced search for suggestions
    useEffect(() => {
        if (!value || value.length < 2) {
            setSuggestions([]);
            setIsOpen(false);
            return;
        }

        const timeoutId = setTimeout(() => {
            const results = searchPincodes(value);
            setSuggestions(results);
            setIsOpen(results.length > 0);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [value]);

    const handlePincodeFetch = useCallback(async (pincode: string) => {
        if (!validatePincode(pincode)) return;

        setIsLoading(true);
        setLastFetchedPincode(pincode);
        
        try {
            const result = await fetchPincodeDetails(pincode);
            if (result.success && result.data && onPincodeFound) {
                onPincodeFound(result.data);
            } else if (!result.success && onPincodeNotFound) {
                // Pincode not found in database, allow manual entry
                onPincodeNotFound();
            }
        } catch (error) {
            console.error('Error fetching pincode details:', error);
            if (onPincodeNotFound) {
                onPincodeNotFound();
            }
        } finally {
            setIsLoading(false);
        }
    }, [onPincodeFound, onPincodeNotFound]);

    // Auto-fetch when pincode is complete and valid
    useEffect(() => {
        if (value && validatePincode(value) && value !== lastFetchedPincode) {
            handlePincodeFetch(value);
        }
    }, [value, lastFetchedPincode, handlePincodeFetch]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (newValue.length <= 6) {
            // Create a proper synthetic event that preserves all properties
            const syntheticEvent = {
                ...e,
                target: {
                    ...e.target,
                    value: newValue,
                    name: e.target.name,
                    type: e.target.type
                },
                currentTarget: {
                    ...e.currentTarget,
                    value: newValue,
                    name: e.target.name,
                    type: e.target.type
                }
            } as React.ChangeEvent<HTMLInputElement>;
            
            onChange(syntheticEvent);
        }
    };

    const handleSuggestionSelect = (pincode: PincodeDetails) => {
        const syntheticEvent = {
            target: { 
                name, 
                value: pincode.pincode,
                type: 'text'
            },
            currentTarget: {
                name,
                value: pincode.pincode,
                type: 'text'
            }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
        setIsOpen(false);
        
        if (onPincodeFound) {
            onPincodeFound(pincode);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (listRef.current && !listRef.current.contains(event.target as Node) &&
            inputRef.current && !inputRef.current.contains(event.target as Node)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    name={name}
                    value={value}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    maxLength={6}
                    className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 ${
                        error ? 'border-red-500' : 'border-gray-300'
                    } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''} ${className || ''}`}
                />
                {isLoading && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>
            
            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
            
            {helpText && !error && (
                <p className="text-gray-500 text-xs mt-1">{helpText}</p>
            )}
            
            {!required && (
                <p className="text-gray-400 text-xs mt-1">Optional - Enter pincode to auto-fill city and state, or enter manually</p>
            )}

            {isOpen && suggestions.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b border-gray-100 last:border-b-0"
                            onClick={() => handleSuggestionSelect(suggestion)}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-medium text-gray-900">{suggestion.pincode}</div>
                                    <div className="text-gray-600 text-xs">
                                        {suggestion.area}, {suggestion.city}, {suggestion.state}
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400 ml-2">
                                    {suggestion.district}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
