import React, { useState } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface CopyType {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface LorryReceiptCopyTabsProps {
  onViewPdf: (copyType: string) => void;
  onDownloadPdf: (copyType: string) => void;
  onPrint: (copyType: string) => void;
  isGenerating: boolean;
  isPrinting: boolean;
  fileName: string;
}

const copyTypes: CopyType[] = [
  {
    id: 'consignor',
    label: 'Consignor',
    description: 'Original copy for the consignor',
    icon: '📋'
  },
  {
    id: 'transporter',
    label: 'Transporter',
    description: 'Duplicate copy for the transporter',
    icon: '🚛'
  },
  {
    id: 'consignee',
    label: 'Consignee',
    description: 'Triplicate copy for the consignee',
    icon: '📦'
  },
  {
    id: 'office',
    label: 'Office Copy',
    description: 'Office copy for records',
    icon: '🏢'
  }
];

export const LorryReceiptCopyTabs: React.FC<LorryReceiptCopyTabsProps> = ({
  onViewPdf,
  onDownloadPdf,
  onPrint,
  isGenerating,
  isPrinting,
  fileName
}) => {
  const [activeTab, setActiveTab] = useState('consignor');

  const getCopyTypeLabel = (id: string) => {
    const copyType = copyTypes.find(type => type.id === id);
    return copyType ? copyType.label : id;
  };

  const getCopyTypeDescription = (id: string) => {
    const copyType = copyTypes.find(type => type.id === id);
    return copyType ? copyType.description : '';
  };

  const getCopyTypeIcon = (id: string) => {
    const copyType = copyTypes.find(type => type.id === id);
    return copyType ? copyType.icon : '📄';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex flex-wrap space-x-2 sm:space-x-8">
          {copyTypes.map((copyType) => (
            <button
              key={copyType.id}
              onClick={() => setActiveTab(copyType.id)}
              className={`py-2 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm transition-colors duration-200 ${
                activeTab === copyType.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="text-sm sm:text-lg">{copyType.icon}</span>
                <span className="hidden sm:inline">{copyType.label}</span>
                <span className="sm:hidden">{copyType.label.split(' ')[0]}</span>
              </div>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <span className="text-3xl">{getCopyTypeIcon(activeTab)}</span>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {getCopyTypeLabel(activeTab)} Copy
              </h3>
              <p className="text-sm text-gray-600">
                {getCopyTypeDescription(activeTab)}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button
            variant="outline"
            onClick={() => onViewPdf(activeTab)}
            disabled={isGenerating || isPrinting}
            className="flex items-center justify-center space-x-2 px-4 py-3 text-sm"
          >
            <span>👁️</span>
            <span className="hidden sm:inline">View PDF</span>
            <span className="sm:hidden">View</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => onDownloadPdf(activeTab)}
            disabled={isGenerating || isPrinting}
            className="flex items-center justify-center space-x-2 px-4 py-3 text-sm"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span className="hidden sm:inline">Generating...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <span>📥</span>
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">Download</span>
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            onClick={() => onPrint(activeTab)}
            disabled={isGenerating || isPrinting}
            className="flex items-center justify-center space-x-2 px-4 py-3 text-sm"
          >
            {isPrinting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span className="hidden sm:inline">Printing...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <span>🖨️</span>
                <span className="hidden sm:inline">Print</span>
                <span className="sm:hidden">Print</span>
              </>
            )}
          </Button>
        </div>

        {/* File Name Display */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            File: {fileName}-{getCopyTypeLabel(activeTab).replace(/\s+/g, '-')}.pdf
          </p>
        </div>
      </Card>
    </div>
  );
};
