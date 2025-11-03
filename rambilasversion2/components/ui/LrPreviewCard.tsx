import React from 'react';
import type { LorryReceipt } from '../../types';
import { formatDate } from '../../services/utils';

interface LrPreviewCardProps {
  lr: LorryReceipt;
  isSelected: boolean;
  onToggle: (lr: LorryReceipt) => void;
  showSelection?: boolean;
}

export const LrPreviewCard: React.FC<LrPreviewCardProps> = ({
  lr,
  isSelected,
  onToggle,
  showSelection = true
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Created':
        return 'bg-blue-100 text-blue-800';
      case 'In Transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div 
      className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
      onClick={() => onToggle(lr)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          {showSelection && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(lr)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-lg font-semibold text-gray-900">
                LR #{lr.lrNumber}
              </h4>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lr.status)}`}>
                {lr.status}
              </span>
            </div>

            {/* Route Information */}
            <div className="mb-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="font-medium">{lr.from}</span>
                <span className="text-gray-400">→</span>
                <span className="font-medium">{lr.to}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(lr.date)}
              </div>
            </div>

            {/* Parties Information */}
            <div className="mb-3">
              <div className="text-sm">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">Consignor:</span>
                  <span className="font-medium text-gray-900">{lr.consignor?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-gray-500">Consignee:</span>
                  <span className="font-medium text-gray-900">{lr.consignee?.name || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Package Information */}
            {lr.packages && lr.packages.length > 0 && (
              <div className="mb-3">
                <div className="text-sm text-gray-600">
                  <div className="flex items-center space-x-4">
                    <span>Packages: <span className="font-medium">{lr.packages[0].count}</span></span>
                    <span>Weight: <span className="font-medium">{lr.packages[0].actualWeight} kg</span></span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {lr.packages[0].description}
                  </div>
                </div>
              </div>
            )}

            {/* Vehicle Information */}
            <div className="text-sm text-gray-600">
              <span className="text-gray-500">Vehicle:</span>
              <span className="font-medium ml-1">{lr.vehicleNumber}</span>
            </div>
          </div>
        </div>

        {/* Amount and Actions */}
        <div className="text-right ml-4">
          <div className="text-xl font-bold text-gray-900 mb-2">
            {formatAmount(lr.totalAmount || 0)}
          </div>
          
          {/* Additional Charges Breakdown */}
          {lr.charges && (
            <div className="text-xs text-gray-500 space-y-1">
              {lr.charges.freight > 0 && (
                <div>Freight: {formatAmount(lr.charges.freight)}</div>
              )}
              {lr.charges.aoc > 0 && (
                <div>AOC: {formatAmount(lr.charges.aoc)}</div>
              )}
              {lr.charges.hamali > 0 && (
                <div>Hamali: {formatAmount(lr.charges.hamali)}</div>
              )}
            </div>
          )}

          {/* E-Way Bill */}
          {lr.eWayBillNo && (
            <div className="text-xs text-gray-500 mt-2">
              <div>EWB: {lr.eWayBillNo}</div>
              {lr.eWayBillValidUpto && (
                <div className="text-red-600 font-medium">
                  Valid: {formatDate(lr.eWayBillValidUpto)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Remarks */}
      {lr.remarks && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <span className="text-gray-500">Remarks:</span>
            <span className="ml-1">{lr.remarks}</span>
          </div>
        </div>
      )}
    </div>
  );
};
