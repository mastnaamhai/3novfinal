import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { Select } from './Select';
import { Button } from './Button';
import type { UnbilledLrFilters } from '../../services/lorryReceiptService';
import { LorryReceiptStatus } from '../../types';

interface LrFilterPanelProps {
  filters: UnbilledLrFilters;
  onFiltersChange: (filters: UnbilledLrFilters) => void;
  onClearFilters: () => void;
  isLoading?: boolean;
}

export const LrFilterPanel: React.FC<LrFilterPanelProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  isLoading = false
}) => {
  const [localFilters, setLocalFilters] = useState<UnbilledLrFilters>(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof UnbilledLrFilters, value: string | number | undefined) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handleApplyFilters = () => {
    onFiltersChange(localFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: UnbilledLrFilters = {};
    setLocalFilters(clearedFilters);
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && value !== ''
  );

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: LorryReceiptStatus.CREATED, label: 'Created' },
    { value: LorryReceiptStatus.IN_TRANSIT, label: 'In Transit' },
    { value: LorryReceiptStatus.DELIVERED, label: 'Delivered' },
    { value: LorryReceiptStatus.UNBILLED, label: 'Unbilled' }
  ];

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-700">Filter Lorry Receipts</h3>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide Filters' : 'Show Filters'}
          </Button>
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
              disabled={isLoading}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Search</label>
              <Input
                placeholder="LR number, from, to, consignor..."
                value={localFilters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Status</label>
              <Select
                value={localFilters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Start Date</label>
              <Input
                type="date"
                value={localFilters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">End Date</label>
              <Input
                type="date"
                value={localFilters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>

            {/* Amount Range */}
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Min Amount (₹)</label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters.minAmount || ''}
                onChange={(e) => handleFilterChange('minAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-600">Max Amount (₹)</label>
              <Input
                type="number"
                placeholder="No limit"
                value={localFilters.maxAmount || ''}
                onChange={(e) => handleFilterChange('maxAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleApplyFilters}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Apply Filters'}
            </Button>
          </div>
        </div>
      )}

      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              Search: {filters.search}
            </span>
          )}
          {filters.status && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              Status: {statusOptions.find(opt => opt.value === filters.status)?.label}
            </span>
          )}
          {filters.startDate && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              From: {filters.startDate}
            </span>
          )}
          {filters.endDate && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              To: {filters.endDate}
            </span>
          )}
          {filters.minAmount && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              Min: ₹{filters.minAmount.toLocaleString()}
            </span>
          )}
          {filters.maxAmount && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              Max: ₹{filters.maxAmount.toLocaleString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
