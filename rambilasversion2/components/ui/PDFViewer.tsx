import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface PDFViewerProps {
  pdfUrl: string;
  fileName: string;
  onClose: () => void;
  onDownload?: () => void;
  onPrint?: () => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  fileName,
  onClose,
  onDownload,
  onPrint
}) => {
  const [zoom, setZoom] = useState(100);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile and set initial zoom
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Set initial zoom for mobile devices
      if (mobile && zoom === 100) {
        setZoom(60); // Start with a more mobile-friendly zoom level
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [zoom]);

  // Handle iframe load
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);

  // Handle iframe error
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setError('Failed to load PDF. Please try downloading the file instead.');
  }, []);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 25, 300));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 25, 50));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(100);
  }, []);

  const fitToWidth = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const pdfWidth = 595; // A4 width in points
      const calculatedZoom = Math.floor((containerWidth / pdfWidth) * 100);
      // On mobile, use a more conservative zoom to ensure content fits
      const maxZoom = isMobile ? 150 : 200;
      const minZoom = isMobile ? 30 : 50;
      setZoom(Math.max(minZoom, Math.min(calculatedZoom, maxZoom)));
    }
  }, [isMobile]);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '=':
          case '+':
            e.preventDefault();
            zoomIn();
            break;
          case '-':
            e.preventDefault();
            zoomOut();
            break;
          case '0':
            e.preventDefault();
            resetZoom();
            break;
          case 'f':
            e.preventDefault();
            toggleFullscreen();
            break;
        }
      }
      
      if (e.key === 'Escape') {
        if (isFullscreen) {
          document.exitFullscreen?.();
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [zoomIn, zoomOut, resetZoom, toggleFullscreen, isFullscreen, onClose]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-start justify-center p-2 sm:p-4 overflow-y-auto" data-pdf-viewer="true">
      <Card 
        ref={containerRef}
        className={`bg-white shadow-2xl ${isFullscreen ? 'w-full h-full max-w-none max-h-none' : isMobile ? 'w-full h-full max-h-[95vh]' : 'w-full max-w-6xl h-full max-h-[90vh]'} flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-gray-800 truncate max-w-md">
              {fileName}
            </h3>
            {isLoading && (
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span>Loading...</span>
              </div>
            )}
          </div>
          
          <div className={`flex items-center space-x-2 ${isMobile ? 'flex-wrap gap-2' : ''}`}>
            {/* Zoom Controls - Hidden on mobile, shown in bottom section */}
            {!isMobile && (
              <>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={zoomOut}
                    disabled={zoom <= 50}
                    title="Zoom Out (Ctrl+-)"
                  >
                    -
                  </Button>
                  <span className="px-2 py-1 text-sm font-medium text-gray-700 min-w-[3rem] text-center">
                    {zoom}%
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={zoomIn}
                    disabled={zoom >= 300}
                    title="Zoom In (Ctrl++)"
                  >
                    +
                  </Button>
                </div>
                
                {/* Zoom Presets */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={fitToWidth}
                    title="Fit to Width"
                  >
                    Fit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={resetZoom}
                    title="Reset Zoom (Ctrl+0)"
                  >
                    100%
                  </Button>
                </div>
              </>
            )}
            
            {/* Action Buttons */}
            <div className={`flex items-center space-x-2 ${isMobile ? 'ml-0' : 'ml-4'}`}>
              {onPrint && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onPrint}
                  title="Print (Ctrl+P)"
                >
                  {isMobile ? 'Print' : 'Print'}
                </Button>
              )}
              
              {onDownload && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onDownload}
                  title="Download"
                >
                  {isMobile ? 'Download' : 'Download'}
                </Button>
              )}
              
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleFullscreen}
                title="Toggle Fullscreen (Ctrl+F)"
              >
                {isFullscreen ? 'Exit' : 'Fullscreen'}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={onClose}
                title="Close (Esc)"
              >
                Close
              </Button>
            </div>
          </div>
        </div>

        {/* PDF Content */}
        <div className="flex-1 overflow-hidden relative">
          {error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="text-red-500 text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Unable to Display PDF</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <div className="flex space-x-4">
                {onDownload && (
                  <Button onClick={onDownload}>
                    Download PDF
                  </Button>
                )}
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-auto bg-gray-100">
              <div 
                className="flex justify-center p-2 sm:p-4"
                style={{ 
                  transform: isMobile ? `scale(${Math.min(zoom / 100, 0.8)})` : `scale(${zoom / 100})`,
                  transformOrigin: 'top center',
                  minHeight: '100%',
                  width: isMobile ? '125%' : '100%' // Compensate for mobile scaling
                }}
              >
                <iframe
                  ref={iframeRef}
                  src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&page=1&view=${isMobile ? 'FitV' : 'FitH'}`}
                  className="border-0 shadow-lg"
                  style={{
                    width: '100%',
                    height: isMobile ? '85vh' : '80vh',
                    minHeight: isMobile ? '400px' : '600px',
                    maxWidth: isMobile ? '100vw' : 'none'
                  }}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  title={fileName}
                />
              </div>
            </div>
          )}
        </div>

        {/* Mobile-specific controls */}
        {isMobile && (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Zoom: {zoom}%</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={fitToWidth}
                className="text-xs"
              >
                Fit to Width
              </Button>
            </div>
            <div className="flex justify-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={zoomOut}
                disabled={zoom <= 50}
                className="flex-1 text-xs"
              >
                Zoom Out
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={resetZoom}
                className="flex-1 text-xs"
              >
                Reset
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={zoomIn}
                disabled={zoom >= 300}
                className="flex-1 text-xs"
              >
                Zoom In
              </Button>
            </div>
          </div>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading PDF...</p>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

// Hook for creating PDF blob URLs
export const usePDFBlob = (pdfData: Blob | null) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    if (pdfData) {
      const url = URL.createObjectURL(pdfData);
      setPdfUrl(url);
      
      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfUrl(null);
    }
  }, [pdfData]);

  return pdfUrl;
};

// Hook for PDF generation with viewer
export const usePDFViewer = () => {
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentPdfUrl, setCurrentPdfUrl] = useState<string | null>(null);
  const [currentFileName, setCurrentFileName] = useState<string>('');

  const openViewer = useCallback((pdfUrl: string, fileName: string) => {
    setCurrentPdfUrl(pdfUrl);
    setCurrentFileName(fileName);
    setIsViewerOpen(true);
  }, []);

  const closeViewer = useCallback(() => {
    setIsViewerOpen(false);
    setCurrentPdfUrl(null);
    setCurrentFileName('');
  }, []);

  const PDFViewerComponent = useCallback(() => {
    if (!isViewerOpen || !currentPdfUrl) return null;

    return (
      <PDFViewer
        pdfUrl={currentPdfUrl}
        fileName={currentFileName}
        onClose={closeViewer}
      />
    );
  }, [isViewerOpen, currentPdfUrl, currentFileName, closeViewer]);

  return {
    openViewer,
    closeViewer,
    isViewerOpen,
    PDFViewerComponent
  };
};
