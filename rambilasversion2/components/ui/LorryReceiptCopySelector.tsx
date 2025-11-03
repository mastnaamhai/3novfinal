import React, { useState } from 'react';
import { Button } from './Button';

export interface CopyType {
  id: string;
  label: string;
  value: string;
}

export interface CopySelection {
  copyType: string;
  showFreightCharges: boolean;
}

interface LorryReceiptCopySelectorProps {
  onDownload: (selection: CopySelection) => void;
  onCancel: () => void;
  isGenerating?: boolean;
  fileName: string;
}

const copyTypes: CopyType[] = [
  { id: 'original', label: 'Original for Consignor', value: 'Original for Consignor' },
  { id: 'duplicate', label: 'Duplicate for Transporter', value: 'Duplicate for Transporter' },
  { id: 'triplicate', label: 'Triplicate for Consignee', value: 'Triplicate for Consignee' },
  { id: 'office', label: 'Office Copy', value: 'Office Copy' }
];

export const LorryReceiptCopySelector: React.FC<LorryReceiptCopySelectorProps> = ({
  onDownload,
  onCancel,
  isGenerating = false,
  fileName
}) => {
  const [selectedCopyType, setSelectedCopyType] = useState<string>('original');
  const [showFreightCharges, setShowFreightCharges] = useState<boolean>(false);

  const handleDownload = () => {
    onDownload({
      copyType: selectedCopyType,
      showFreightCharges
    });
  };

  return (
    <div className="space-y-6">
      {/* File Info */}
      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">{fileName}</p>
        <p className="text-xs text-gray-500">Select copy type and options</p>
      </div>

      {/* Copy Type Selection */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Copy Type</h4>
        <div className="space-y-2">
          {copyTypes.map((copyType) => (
            <label
              key={copyType.id}
              className="flex items-center p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                name="copyType"
                value={copyType.value}
                checked={selectedCopyType === copyType.value}
                onChange={(e) => setSelectedCopyType(e.target.value)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              />
              <span className="ml-3 text-sm text-gray-700">{copyType.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Freight Charges Toggle */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Options</h4>
        <label className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">Freight charges in PDF</span>
            <span className="text-xs text-gray-500">Include pricing information in the document</span>
          </div>
          <div className="relative">
            <input
              type="checkbox"
              checked={showFreightCharges}
              onChange={(e) => setShowFreightCharges(e.target.checked)}
              className="sr-only"
            />
            <div
              className={`w-11 h-6 rounded-full transition-colors duration-200 ${
                showFreightCharges ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${
                  showFreightCharges ? 'translate-x-5' : 'translate-x-0.5'
                }`}
                style={{ marginTop: '2px' }}
              />
            </div>
          </div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-gray-200">
        <Button
          variant="secondary"
          onClick={onCancel}
          className="flex-1"
          disabled={isGenerating}
        >
          Cancel
        </Button>
        <Button
          onClick={handleDownload}
          className="flex-1"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </div>
          ) : (
            'Download'
          )}
        </Button>
      </div>
    </div>
  );
};

export default LorryReceiptCopySelector;
