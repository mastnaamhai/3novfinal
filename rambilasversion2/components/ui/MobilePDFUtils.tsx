import { useState, useEffect } from 'react';

export const useMobilePDF = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [supportsPDF, setSupportsPDF] = useState(true);
  const [supportsPrint, setSupportsPrint] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      setSupportsPDF(typeof window !== 'undefined' && 'print' in window);
      setSupportsPrint(typeof window !== 'undefined' && 'print' in window);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return {
    isMobile,
    supportsPDF,
    supportsPrint,
    fallbackMessage: isMobile && !supportsPDF ? 'PDF viewing not supported on this device' : null
  };
};

export const MobilePDFUtils = {
  isMobileDevice: () => window.innerWidth <= 768,
  supportsPDFViewer: () => typeof window !== 'undefined' && 'print' in window,
  getMobilePDFStyles: () => ({
    width: '100%',
    maxWidth: '100%',
    overflow: 'auto'
  })
};
