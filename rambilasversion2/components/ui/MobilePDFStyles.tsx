import React from 'react';

export const MobilePDFStyles: React.FC = () => {
  return (
    <style>{`
      @media (max-width: 768px) {
        .pdf-container {
          width: 100% !important;
          max-width: 100% !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        
        .pdf-content {
          font-size: 12px !important;
          line-height: 1.4 !important;
          font-family: Arial, sans-serif !important;
        }
        
        .pdf-table {
          font-size: 11px !important;
        }
        
        .pdf-header {
          padding: 12px !important;
        }
        
        .pdf-footer {
          padding: 12px !important;
        }
        
        /* Typography improvements for mobile LR PDFs */
        .pdf-content h1, .pdf-content h2, .pdf-content h3, .pdf-content h4 {
          font-weight: bold !important;
          margin-bottom: 8px !important;
          page-break-after: avoid !important;
        }
        
        .pdf-content h1 {
          font-size: 16px !important;
        }
        
        .pdf-content h2 {
          font-size: 14px !important;
        }
        
        .pdf-content h3 {
          font-size: 12px !important;
        }
        
        .pdf-content h4 {
          font-size: 11px !important;
        }
        
        .pdf-content p, .pdf-content div {
          font-size: 11px !important;
          line-height: 1.4 !important;
          margin-bottom: 4px !important;
        }
        
        .pdf-content .text-xs {
          font-size: 10px !important;
        }
        
        .pdf-content .text-sm {
          font-size: 11px !important;
        }
        
        .pdf-content .text-base {
          font-size: 12px !important;
        }
        
        .pdf-content .text-lg {
          font-size: 14px !important;
        }
        
        .pdf-content .text-xl {
          font-size: 16px !important;
        }
        
        /* Table typography for mobile */
        .pdf-content table {
          font-size: 11px !important;
        }
        
        .pdf-content th, .pdf-content td {
          font-size: 11px !important;
          padding: 6px 8px !important;
        }
        
        /* Ensure proper spacing between sections on mobile */
        .pdf-content .mb-1 {
          margin-bottom: 8px !important;
        }
        
        .pdf-content .mb-2 {
          margin-bottom: 12px !important;
        }
        
        .pdf-content .mb-3 {
          margin-bottom: 16px !important;
        }
        
        .pdf-content .mb-4 {
          margin-bottom: 20px !important;
        }
      }
    `}</style>
  );
};
