import React from 'react';
import { Button } from './Button';

interface MobileActionButtonProps {
  onClick: () => void;
  isGenerating?: boolean;
  isPrinting?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MobileActionButton: React.FC<MobileActionButtonProps> = ({
  onClick,
  isGenerating = false,
  isPrinting = false,
  className = '',
  children
}) => {
  const isLoading = isGenerating || isPrinting;
  const loadingText = isGenerating ? 'Generating...' : 'Printing...';

  return (
    <Button
      onClick={onClick}
      disabled={isLoading}
      className={`fixed bottom-4 right-4 z-40 shadow-lg rounded-full px-6 py-3 text-sm font-medium ${className}`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
      }}
    >
      {isLoading ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingText}
        </div>
      ) : (
        children || (
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Print / Download Copies
          </div>
        )
      )}
    </Button>
  );
};

export default MobileActionButton;
