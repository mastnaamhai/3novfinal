import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { MobilePDFUtils, useMobilePDF } from './MobilePDFUtils';

interface PDFActionBarProps {
  fileName: string;
  onDownload: () => void;
  onPrint: () => void;
  onView: () => void;
  onBack: () => void;
  isGenerating?: boolean;
  isPrinting?: boolean;
  className?: string;
}

export const PDFActionBar: React.FC<PDFActionBarProps> = ({
  fileName,
  onDownload,
  onPrint,
  onView,
  onBack,
  isGenerating = false,
  isPrinting = false,
  className = ''
}) => {
  const { isMobile, supportsPDF, supportsPrint, fallbackMessage } = useMobilePDF();
  const [showMobileActions, setShowMobileActions] = useState(false);

  // Mobile-specific actions
  if (isMobile) {
    return (
      <MobilePDFUtils
        fileName={fileName}
        onDownload={onDownload}
        onPrint={supportsPrint ? onPrint : () => alert(fallbackMessage || 'Printing not supported')}
        onView={supportsPDF ? onView : () => alert(fallbackMessage || 'PDF viewing not supported')}
        isGenerating={isGenerating}
        isPrinting={isPrinting}
      />
    );
  }

  // Desktop actions
  return (
    <div className={`flex justify-end items-center space-x-2 no-print print-controls ${className}`}>
      <Button
        onClick={onView}
        variant="secondary"
        size="sm"
        disabled={!supportsPDF}
        title={!supportsPDF ? fallbackMessage : 'View PDF in new window'}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        View PDF
      </Button>
      
      <Button
        onClick={onPrint}
        variant="secondary"
        size="sm"
        disabled={isPrinting || !supportsPrint}
        title={!supportsPrint ? fallbackMessage : 'Print document'}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        {isPrinting ? 'Printing...' : 'Print'}
      </Button>
      
      <Button
        onClick={onDownload}
        size="sm"
        disabled={isGenerating}
        title="Download PDF file"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isGenerating ? 'Generating PDF...' : 'Download PDF'}
      </Button>
      
      <Button
        onClick={onBack}
        variant="secondary"
        size="sm"
        title="Go back to previous page"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </Button>
    </div>
  );
};

// Compact action bar for smaller spaces
export const CompactPDFActionBar: React.FC<Omit<PDFActionBarProps, 'className'>> = (props) => {
  const { isMobile } = useMobilePDF();
  const [showDropdown, setShowDropdown] = useState(false);

  if (isMobile) {
    return <PDFActionBar {...props} />;
  }

  return (
    <div className="relative no-print print-controls">
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        variant="secondary"
        size="sm"
        className="flex items-center"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
        Actions
      </Button>
      
      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="py-1">
            <button
              onClick={() => {
                props.onView();
                setShowDropdown(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              disabled={!useMobilePDF().supportsPDF}
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View PDF
            </button>
            
            <button
              onClick={() => {
                props.onPrint();
                setShowDropdown(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              disabled={props.isPrinting || !useMobilePDF().supportsPrint}
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              {props.isPrinting ? 'Printing...' : 'Print'}
            </button>
            
            <button
              onClick={() => {
                props.onDownload();
                setShowDropdown(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              disabled={props.isGenerating}
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {props.isGenerating ? 'Generating...' : 'Download PDF'}
            </button>
            
            <div className="border-t border-gray-100 my-1"></div>
            
            <button
              onClick={() => {
                props.onBack();
                setShowDropdown(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFActionBar;
