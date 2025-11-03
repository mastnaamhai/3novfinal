import React, { useState, useRef, useEffect } from 'react';

interface AutocompleteInputProps {
    label?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    options?: string[];
    suggestions?: string[];
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
    disabled?: boolean;
    helpText?: string;
}

export const AutocompleteInput: React.FC<AutocompleteInputProps> = ({
    label,
    name,
    value,
    onChange,
    options = [],
    suggestions = [],
    placeholder,
    required = false,
    error,
    className = '',
    disabled = false,
    helpText
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);


    // Filter options when value changes
    const currentOptions = suggestions.length > 0 ? suggestions : options;
    const filteredOptions = value && value.length >= 2 
        ? currentOptions.filter(option =>
            option.toLowerCase().includes(value.toLowerCase())
        )
        : [];

    // Sync isOpen state with filtered options
    useEffect(() => {
        setIsOpen(filteredOptions.length > 0);
    }, [filteredOptions.length]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (listRef.current && !listRef.current.contains(event.target as Node) &&
                inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
    };

    const handleOptionSelect = (option: string) => {
        const syntheticEvent = {
            target: { name, value: option }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
        setIsOpen(false);
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative ${className}`}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
                ref={inputRef}
                type="text"
                name={name}
                value={value}
                onChange={handleInputChange}
                onFocus={() => {
                    if (value.length >= 2) {
                        setIsOpen(true);
                    }
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 ${
                    error ? 'border-red-500' : 'border-gray-300'
                } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''} ${className || ''}`}
            />
            
            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
            
            {helpText && !error && (
                <p className="text-gray-500 text-xs mt-1">{helpText}</p>
            )}

            {isOpen && filteredOptions.length > 0 && (
                <ul
                    ref={listRef}
                    className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                    {filteredOptions.slice(0, 10).map((option, index) => (
                        <li
                            key={index}
                            className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            onClick={() => handleOptionSelect(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
