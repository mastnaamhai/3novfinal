import React, { useEffect } from 'react';

/**
 * ModalManager - Utility component to detect and fix stuck modals/overlays
 * This helps prevent UI overlapping issues
 */
export const ModalManager: React.FC = () => {
  useEffect(() => {
    // Function to detect and close stuck modals
    const detectStuckModals = () => {
      // Check for elements with high z-index that might be stuck
      const highZElements = document.querySelectorAll('[class*="z-50"], [class*="z-40"]');
      
      highZElements.forEach(element => {
        const elementClasses = element.className;
        
          // Check if it's a modal/overlay that should be closed
          if (elementClasses.includes('fixed') && elementClasses.includes('inset-0')) {
            // Skip legitimate form modals and PDF viewers - they should not be auto-closed
            if (element.hasAttribute('data-form-modal') ||
                element.hasAttribute('data-pdf-viewer') ||
                element.querySelector('iframe[src*=".pdf"]') || 
                element.querySelector('iframe[title*="PDF"]') ||
                element.querySelector('iframe[title*="pdf"]')) {
              return; // Skip this element as it's a legitimate modal
            }
          
          // Check if it's visible but shouldn't be
          const computedStyle = window.getComputedStyle(element);
          const isVisible = computedStyle.display !== 'none' && 
                           computedStyle.visibility !== 'hidden' && 
                           computedStyle.opacity !== '0';
          
          if (isVisible) {
            // Check if it has a backdrop but no content
            const hasBackdrop = elementClasses.includes('bg-black') || 
                               elementClasses.includes('bg-opacity');
            
            if (hasBackdrop) {
              // Additional check: make sure it's not a PDF viewer by checking for PDF-related content
              const hasPdfContent = element.querySelector('iframe') && 
                                   (element.querySelector('iframe')?.src?.includes('.pdf') ||
                                    element.querySelector('iframe')?.title?.toLowerCase().includes('pdf'));
              
              if (!hasPdfContent) {
                // This might be a stuck modal, try to close it
                console.warn('Detected potentially stuck modal/overlay:', element);
                
                // Try to trigger a close event
                const closeEvent = new KeyboardEvent('keydown', {
                  key: 'Escape',
                  code: 'Escape',
                  keyCode: 27,
                  which: 27,
                  bubbles: true,
                  cancelable: true
                });
                
                document.dispatchEvent(closeEvent);
              }
            }
          }
        }
      });
    };

    // Run detection on mount
    detectStuckModals();

    // Set up periodic checks - reduced frequency to avoid interfering with PDF viewers
    const interval = setInterval(detectStuckModals, 15000);

    // Cleanup
    return () => {
      clearInterval(interval);
    };
  }, []);

  // Emergency close function for stuck modals
  useEffect(() => {
    const handleEmergencyClose = (event: KeyboardEvent) => {
      // Ctrl+Shift+Escape to force close all modals
      if (event.ctrlKey && event.shiftKey && event.key === 'Escape') {
        console.log('Emergency modal close triggered');
        
        // Reset body overflow
        document.body.style.overflow = 'unset';
        
        // Remove all high z-index overlays (except legitimate modals and PDF viewers)
        const overlays = document.querySelectorAll('[class*="z-50"], [class*="z-40"]');
        overlays.forEach(overlay => {
          if (overlay.className.includes('fixed') && overlay.className.includes('inset-0')) {
            // Don't remove legitimate form modals and PDF viewers even in emergency close
            if (!overlay.hasAttribute('data-form-modal') &&
                !overlay.hasAttribute('data-pdf-viewer') &&
                !overlay.querySelector('iframe[src*=".pdf"]') &&
                !overlay.querySelector('iframe[title*="PDF"]') &&
                !overlay.querySelector('iframe[title*="pdf"]')) {
              overlay.remove();
            }
          }
        });
        
        // Force reload if needed
        setTimeout(() => {
          if (document.querySelectorAll('[class*="z-50"]').length > 0) {
            console.log('Forcing page reload due to stuck modals');
            window.location.reload();
          }
        }, 1000);
      }
    };

    document.addEventListener('keydown', handleEmergencyClose);
    return () => document.removeEventListener('keydown', handleEmergencyClose);
  }, []);

  return null; // This component doesn't render anything
};

export default ModalManager;
