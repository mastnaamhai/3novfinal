import React, { useState, useEffect, useRef } from 'react';
import { 
    getAllStates, 
    getCitiesByState, 
    searchStates, 
    searchCities, 
    type StateInfo 
} from '../../constants/indianStatesCities';

interface StateCityDropdownProps {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onStateChange?: (state: string) => void;
    onCityChange?: (city: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    className?: string;
    disabled?: boolean;
    helpText?: string;
    type: 'state' | 'city';
    selectedState?: string; // Required when type is 'city'
}

export const StateCityDropdown: React.FC<StateCityDropdownProps> = ({
    label,
    name,
    value,
    onChange,
    onStateChange,
    onCityChange,
    placeholder,
    required = false,
    error,
    className = '',
    disabled = false,
    helpText,
    type,
    selectedState
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [allOptions, setAllOptions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    // Load initial options
    useEffect(() => {
        if (type === 'state') {
            const states = getAllStates().map(state => state.name);
            setAllOptions(states);
        } else if (type === 'city' && selectedState) {
            const cities = getCitiesByState(selectedState);
            setAllOptions(cities);
        }
    }, [type, selectedState]);

    // Handle search
    useEffect(() => {
        if (!value || value.length < 1) {
            setSuggestions(allOptions.slice(0, 20)); // Show first 20 options
            return;
        }

        const timeoutId = setTimeout(() => {
            let results: string[] = [];
            
            if (type === 'state') {
                const stateResults = searchStates(value);
                results = stateResults.map(state => state.name);
            } else if (type === 'city') {
                if (selectedState) {
                    results = searchCities(value, selectedState);
                } else {
                    results = searchCities(value);
                }
            }
            
            setSuggestions(results.slice(0, 20)); // Limit to 20 results
        }, 200);

        return () => clearTimeout(timeoutId);
    }, [value, allOptions, type, selectedState]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e);
        setIsOpen(true);
    };

    const handleSuggestionSelect = (selectedValue: string) => {
        const syntheticEvent = {
            target: { name, value: selectedValue }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(syntheticEvent);
        setIsOpen(false);
        
        if (type === 'state' && onStateChange) {
            onStateChange(selectedValue);
        } else if (type === 'city' && onCityChange) {
            onCityChange(selectedValue);
        }
    };

    const handleInputFocus = () => {
        setIsOpen(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setIsOpen(true);
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

    const getPlaceholder = () => {
        if (placeholder) return placeholder;
        if (type === 'state') return 'Select or type state name';
        if (type === 'city') return selectedState ? `Select or type city in ${selectedState}` : 'Select or type city name';
        return 'Type to search...';
    };

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
                    onFocus={handleInputFocus}
                    onKeyDown={handleKeyDown}
                    placeholder={getPlaceholder()}
                    required={required}
                    disabled={disabled}
                    className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-400 ${
                        error ? 'border-red-500' : 'border-gray-300'
                    } ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : ''} ${className || ''}`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </div>
            
            {error && (
                <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
            
            {helpText && !error && (
                <p className="text-gray-500 text-xs mt-1">{helpText}</p>
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
                            <div className="font-medium text-gray-900">{suggestion}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
