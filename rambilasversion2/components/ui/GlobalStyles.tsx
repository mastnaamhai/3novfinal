import React from 'react';

/**
 * GlobalStyles - Global CSS fixes and enhancements
 * Helps prevent UI overlapping issues and provides consistent styling
 */
export const GlobalStyles: React.FC = () => {
  return (
    <style>{`
      /* Global CSS fixes and enhancements */
      
      /* Prevent body scroll when modals are open */
      body.modal-open {
        overflow: hidden !important;
        height: 100vh !important;
      }
      
      /* Ensure proper z-index stacking */
      .z-50 {
        z-index: 50 !important;
      }
      
      .z-40 {
        z-index: 40 !important;
      }
      
      .z-30 {
        z-index: 30 !important;
      }
      
      /* Fix potential overlay issues */
      .fixed.inset-0 {
        position: fixed !important;
        top: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        left: 0 !important;
      }
      
      /* Ensure modals are properly positioned */
      .modal-backdrop {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        z-index: 40 !important;
      }
      
      /* Prevent text selection on UI elements */
      .no-select {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      /* Smooth transitions for all interactive elements */
      button, a, [role="button"] {
        transition: all 0.2s ease-in-out !important;
      }
      
      /* Enhanced focus states for accessibility */
      button:focus-visible, a:focus-visible, [role="button"]:focus-visible {
        outline: 2px solid #4f46e5 !important;
        outline-offset: 2px !important;
      }
      
      /* Fix potential layout issues */
      .container {
        max-width: 100% !important;
        overflow-x: hidden !important;
      }
      
      /* Ensure proper backdrop blur support */
      .backdrop-blur-lg {
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
      }
      
      /* Fix potential purple overlay issues */
      .purple-overlay-fix {
        display: none !important;
      }
      
      /* Ensure proper mobile viewport handling */
      @media (max-width: 768px) {
        .mobile-container {
          max-width: 100vw !important;
          overflow-x: hidden !important;
        }
      }
      
      /* Enhanced scrollbar styling */
      .scrollbar-hide {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      
      .scrollbar-hide::-webkit-scrollbar {
        display: none !important;
      }
      
      /* Smooth scrolling for better UX */
      html {
        scroll-behavior: smooth !important;
      }
      
      /* Prevent layout shift on image load */
      img {
        max-width: 100% !important;
        height: auto !important;
      }
      
      /* Fix potential text overflow issues */
      .text-ellipsis {
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
      }
    `}</style>
  );
};

export default GlobalStyles;
