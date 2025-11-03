import React from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';

export interface SortOption {
  value: string;
  label: string;
}

export interface UniversalSearchSortProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  sortBy: string;
  onSortChange: (value: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  sortOptions: SortOption[];
  totalItems: number;
  filteredItems: number;
  onClearSearch?: () => void;
  className?: string;
}

export const UniversalSearchSort: React.FC<UniversalSearchSortProps> = ({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  sortOptions,
  totalItems,
  filteredItems,
  onClearSearch,
  className = ''
}) => {
  const handleSortChange = (value: string) => {
    if (sortBy === value) {
      onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      onSortChange(value);
      onSortOrderChange('asc');
    }
  };

  const getSortOptionLabel = (value: string) => {
    const option = sortOptions.find(opt => opt.value === value);
    return option ? option.label : value;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="flex-1">
          <Input
            label="Search"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            icon={
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
        
        {/* Sort Controls */}
        <div className="flex gap-2">
          <Select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            className="min-w-[140px]"
          >
            {sortOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          
          <Button
            variant="outline"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3"
            title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
          >
            {sortOrder === 'asc' ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </Button>
        </div>
      </div>
      
      {/* Results Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-800">{filteredItems}</span> of{' '}
            <span className="font-semibold text-gray-800">{totalItems}</span> items
            {searchTerm && (
              <span className="ml-1">
                (filtered from <span className="font-semibold text-gray-800">{totalItems}</span> total)
              </span>
            )}
          </p>
          
          {/* Sort Status */}
          <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            Sorted by {getSortOptionLabel(sortBy)} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
          </div>
        </div>
        
        {searchTerm && onClearSearch && (
          <Button
            variant="link"
            onClick={onClearSearch}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Clear Search
          </Button>
        )}
      </div>
    </div>
  );
};
