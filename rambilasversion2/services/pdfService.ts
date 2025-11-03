// Enhanced PDF Service with printing, downloading, and viewing capabilities

export interface PDFOptions {
  fileName: string;
  orientation?: 'portrait' | 'landscape';
  format?: 'a4' | 'a3' | 'letter';
  quality?: 'low' | 'medium' | 'high';
  useTextContent?: boolean;
  margins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface PrintOptions {
  orientation?: 'portrait' | 'landscape';
  scale?: 'actual-size' | 'fit' | 'shrink-to-fit';
  margins?: 'minimum' | 'default' | 'custom';
  customMargins?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Wait for libraries to load
const waitForLibraries = (): Promise<{ jsPDF: any; html2canvas: any }> => {
  return new Promise((resolve, reject) => {
    const maxAttempts = 50; // 5 seconds max wait
    let attempts = 0;

    const checkLibraries = () => {
      attempts++;
      
      if (typeof (window as any).jspdf !== 'undefined' && typeof (window as any).html2canvas !== 'undefined') {
        resolve({
          jsPDF: (window as any).jspdf.jsPDF,
          html2canvas: (window as any).html2canvas
        });
      } else if (attempts >= maxAttempts) {
        reject(new Error('PDF libraries failed to load within timeout period'));
      } else {
        setTimeout(checkLibraries, 100);
      }
    };

    checkLibraries();
  });
};

// Generate descriptive filename
const generateFileName = (baseName: string | number, documentType: string, documentNumber?: string | number, date?: string): string => {
  const timestamp = date || new Date().toISOString().split('T')[0];
  const cleanBaseName = String(baseName).replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanDocNumber = documentNumber ? String(documentNumber).replace(/[^a-zA-Z0-9_-]/g, '_') : '';
  
  return `${documentType}_${cleanDocNumber ? cleanDocNumber + '_' : ''}${timestamp}.pdf`;
};

// Get quality settings based on option
// Reduced scale for invoices to prevent corruption (high scale can cause memory issues)
const getQualitySettings = (quality: 'low' | 'medium' | 'high', isInvoice: boolean = false) => {
  // For invoices, use slightly lower scale to prevent corruption
  const invoiceScale = isInvoice ? 0.5 : 0;
  
  switch (quality) {
    case 'low':
      return { scale: 2 - invoiceScale, compression: 'FAST' };
    case 'medium':
      return { scale: 2.5 - invoiceScale, compression: 'MEDIUM' };
    case 'high':
    default:
      return { scale: Math.max(2, 3 - invoiceScale), compression: 'SLOW' };
  }
};

// Enhanced PDF generation with better quality and file size control
export const generatePdf = async (elementId: string, options: PDFOptions): Promise<void> => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    const { jsPDF, html2canvas } = await waitForLibraries();
    
    // Enhanced canvas options for better quality and performance
    // For invoices, ensure we capture the full width properly
    const isInvoice = elementId.includes('invoice');
    const qualitySettings = getQualitySettings(options.quality || 'high', isInvoice);
    
    // Wait for any animations/transitions to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Ensure all transforms are removed before capture - critical for preventing corruption
    const invoiceContainer = document.getElementById('invoice-pdf-container');
    if (invoiceContainer) {
      const wrapperDiv = invoiceContainer.querySelector('div[style*="transform"]');
      if (wrapperDiv) {
        const wrapper = wrapperDiv as HTMLElement;
        const originalTransform = wrapper.style.transform;
        wrapper.style.transform = 'none';
        wrapper.style.visibility = 'hidden';
        await new Promise(resolve => setTimeout(resolve, 50));
        wrapper.style.transform = originalTransform;
        wrapper.style.visibility = 'visible';
      }
    }
    
    const canvas = await html2canvas(input, {
      scale: qualitySettings.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: input.scrollWidth,
      height: input.scrollHeight,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      // Disable letterRendering for invoices - can cause corruption
      letterRendering: false,
      // Remove any transforms before capturing and clean up container styling
      onclone: (clonedDoc: Document) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          const clonedEl = clonedElement as HTMLElement;
          
          // Explicit check for invoice-pdf-container element by ID
          const invoiceContainer = clonedDoc.getElementById('invoice-pdf-container');
          if (invoiceContainer) {
            const containerEl = invoiceContainer as HTMLElement;
            // Force remove bg-gray-300, p-4 classes from container
            containerEl.classList.remove('bg-gray-300', 'bg-gray-200', 'bg-gray-100', 'p-4', 'p-8', 'p-2', 'p-6');
            // Set transparent background and remove padding/margin
            containerEl.style.backgroundColor = 'transparent';
            containerEl.style.padding = '0';
            containerEl.style.margin = '0';
            // Remove any inline padding styles
            if (containerEl.style.padding && containerEl.style.padding.includes('px')) {
              containerEl.style.padding = '0';
            }
          }
          
          // Remove grey backgrounds and padding from container elements
          // Check for common background classes
          clonedEl.classList.remove('bg-gray-300', 'bg-gray-200', 'bg-gray-100', 'p-4', 'p-8', 'p-2', 'p-6');
          
          // Remove background colors from inline styles and computed styles
          const computedStyle = window.getComputedStyle(input);
          if (computedStyle.backgroundColor && 
              (computedStyle.backgroundColor.includes('rgb(209, 213, 219)') || // gray-300
               computedStyle.backgroundColor.includes('rgb(229, 231, 235)') || // gray-200
               computedStyle.backgroundColor.includes('rgb(243, 244, 246)') || // gray-100
               computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
               computedStyle.backgroundColor !== 'transparent' &&
               computedStyle.backgroundColor !== 'white' &&
               computedStyle.backgroundColor !== 'rgb(255, 255, 255)')) {
            clonedEl.style.backgroundColor = '#ffffff';
          }
          
          // Remove padding from containers - check all padding-related classes
          if (clonedEl.classList.contains('p-4') || clonedEl.classList.contains('p-8') || 
              clonedEl.classList.contains('p-2') || clonedEl.classList.contains('p-6')) {
            clonedEl.style.padding = '0';
          }
          // Also check for inline padding (including '20px' etc.)
          if (computedStyle.padding && parseFloat(computedStyle.padding) > 0) {
            clonedEl.style.padding = '0';
          }
          // Force remove inline padding if present
          if (clonedEl.style.padding && clonedEl.style.padding.includes('px')) {
            clonedEl.style.padding = '0';
          }
          // Set margin to 0
          clonedEl.style.margin = '0';
          
          // Reset any transforms that might interfere with capture
          clonedEl.style.transform = 'none';
          
          // Remove transforms from ALL child divs to ensure preview zoom doesn't affect PDF
          // This is critical because the preview scale is applied via CSS transform on a wrapper div
          const allDivs = clonedEl.querySelectorAll('div');
          allDivs.forEach((div: Element) => {
            const divEl = div as HTMLElement;
            if (divEl.style.transform && divEl.style.transform.includes('scale')) {
              divEl.style.transform = 'none';
              divEl.style.transformOrigin = 'top center';
            }
            // Also remove any CSS transform from computed styles that might interfere
            const computedTransform = clonedDoc.defaultView?.getComputedStyle(divEl).transform;
            if (computedTransform && computedTransform !== 'none') {
              divEl.style.transform = 'none';
            }
          });
          
          // Also reset transforms in child elements (for invoice-pdf-container wrapper case)
          const innerInvoice = clonedDoc.getElementById('invoice-pdf');
          if (innerInvoice) {
            (innerInvoice as HTMLElement).style.transform = 'none';
            // Ensure proper width for landscape invoices - use computed width from original
            if (isInvoice) {
              const originalInnerInvoice = document.getElementById('invoice-pdf');
              if (originalInnerInvoice) {
                const computedWidth = window.getComputedStyle(originalInnerInvoice).width;
                (innerInvoice as HTMLElement).style.width = computedWidth || '420mm';
              }
            }
          }
          
          // Find and clean up any print-container or wrapper divs with grey backgrounds
          const wrapperDivs = clonedEl.querySelectorAll('div.print-container, div[class*="bg-gray"]');
          wrapperDivs.forEach((wrapper: Element) => {
            const wrapperEl = wrapper as HTMLElement;
            wrapperEl.classList.remove('bg-gray-300', 'bg-gray-200', 'bg-gray-100');
            
            // Check inline style first, then try computed style
            const inlineBg = wrapperEl.style.backgroundColor;
            let bgColor = inlineBg;
            
            if (!bgColor || bgColor === '' || bgColor === 'transparent') {
              try {
                const wrapperComputed = clonedDoc.defaultView?.getComputedStyle(wrapperEl);
                if (wrapperComputed) {
                  bgColor = wrapperComputed.backgroundColor;
                }
              } catch (e) {
                // Fallback: set to white if we can't determine
                bgColor = '';
              }
            }
            
            if (bgColor && 
                (bgColor.includes('rgb(209, 213, 219)') ||
                 bgColor.includes('rgb(229, 231, 235)') ||
                 bgColor.includes('rgb(243, 244, 246)') ||
                 (bgColor !== 'rgba(0, 0, 0, 0)' && 
                  bgColor !== 'transparent' &&
                  bgColor !== 'white' &&
                  bgColor !== 'rgb(255, 255, 255)'))) {
              wrapperEl.style.backgroundColor = '#ffffff';
            }
            
            // Remove padding
            if (wrapperEl.classList.contains('p-4') || wrapperEl.classList.contains('p-8') || 
                wrapperEl.classList.contains('p-2') || wrapperEl.classList.contains('p-6')) {
              wrapperEl.style.padding = '0';
            } else if (wrapperEl.style.padding && parseFloat(wrapperEl.style.padding) > 0) {
              wrapperEl.style.padding = '0';
            }
          });
          
          // Ensure proper width for landscape invoices on the container
          if (isInvoice) {
            const computedWidth = window.getComputedStyle(input).width;
            clonedEl.style.width = computedWidth || '420mm';
            // Ensure container has no background and no padding for full-page printing
            clonedEl.style.backgroundColor = 'transparent';
            clonedEl.style.padding = '0';
            clonedEl.style.margin = '0';
          }
        }
      }
    });
    
    // Validate canvas before proceeding
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendering failed: invalid dimensions');
    }
    
    // Check for canvas size limits (browsers typically limit to 16,384px per dimension)
    const maxDimension = 16384;
    if (canvas.width > maxDimension || canvas.height > maxDimension) {
      console.warn('Canvas size exceeds browser limits, reducing scale and retrying...');
      // Retry with lower scale
      const reducedScale = Math.max(1, qualitySettings.scale * 0.7);
      const retryCanvas = await html2canvas(input, {
        scale: reducedScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: input.scrollWidth,
        height: input.scrollHeight,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        letterRendering: false,
      });
      
      if (!retryCanvas || retryCanvas.width === 0 || retryCanvas.height === 0) {
        throw new Error('Canvas rendering failed after scale reduction');
      }
      
      // Use the retry canvas instead
      const imgData = retryCanvas.toDataURL('image/png', 0.95);
      
      const pdf = new jsPDF({
        orientation: options.orientation || 'portrait',
        unit: 'pt',
        format: options.format || 'a4',
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = retryCanvas.width;
      const canvasHeight = retryCanvas.height;
      
      const isLandscapeInvoice = options.orientation === 'landscape' && elementId.includes('invoice');
      const margins = options.margins || (isLandscapeInvoice 
        ? { top: 0, right: 0, bottom: 0, left: 0 }
        : { top: 20, right: 20, bottom: 20, left: 20 });
      const contentWidth = pdfWidth - margins.left - margins.right;
      const contentHeight = pdfHeight - margins.top - margins.bottom;

      const widthRatio = contentWidth / canvasWidth;
      const heightRatio = contentHeight / canvasHeight;
      const scale = Math.min(widthRatio, heightRatio);
      
      let imgWidth = canvasWidth * scale;
      let imgHeight = canvasHeight * scale;

      const x = margins.left + (contentWidth - imgWidth) / 2;
      const y = margins.top + (contentHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, qualitySettings.compression);
      
      const fileName = generateFileName(options.fileName, 'Document');
      pdf.save(fileName);
      return;
    }
    
    // Use PNG for lossless quality (no compression artifacts)
    // Use slightly lower quality (0.95) to reduce file size without significant quality loss
    const imgData = canvas.toDataURL('image/png', 0.95);
    
    // Create PDF with specified options
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'pt',
      format: options.format || 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    // Apply margins - use zero margins for landscape invoices for edge-to-edge printing
    const isLandscapeInvoice = options.orientation === 'landscape' && elementId.includes('invoice');
    const margins = options.margins || (isLandscapeInvoice 
      ? { top: 0, right: 0, bottom: 0, left: 0 }
      : { top: 20, right: 20, bottom: 20, left: 20 });
    const contentWidth = pdfWidth - margins.left - margins.right;
    const contentHeight = pdfHeight - margins.top - margins.bottom;

    // Auto-fit: Calculate scale to fill entire page edge-to-edge
    const widthRatio = contentWidth / canvasWidth;
    const heightRatio = contentHeight / canvasHeight;
    const scale = Math.min(widthRatio, heightRatio);
    
    let imgWidth = canvasWidth * scale;
    let imgHeight = canvasHeight * scale;

    // Center the content (or position at edges for true edge-to-edge)
    const x = margins.left + (contentWidth - imgWidth) / 2;
    const y = margins.top + (contentHeight - imgHeight) / 2;

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, qualitySettings.compression);
    
    // Generate descriptive filename
    const fileName = generateFileName(options.fileName, 'Document');
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Enhanced multi-page PDF generation
export const generateMultiPagePdf = async (elementId: string, options: PDFOptions): Promise<void> => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    const { jsPDF, html2canvas } = await waitForLibraries();
    const isInvoice = elementId.includes('invoice');
    const qualitySettings = getQualitySettings(options.quality || 'high', isInvoice);
    
    // Wait for any animations/transitions to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const canvas = await html2canvas(input, {
      scale: qualitySettings.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: input.scrollWidth,
      height: input.scrollHeight,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      letterRendering: false,
      onclone: (clonedDoc: Document) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          const clonedEl = clonedElement as HTMLElement;
          
          // Remove grey backgrounds and padding from container elements
          clonedEl.classList.remove('bg-gray-300', 'bg-gray-200', 'bg-gray-100');
          
          const computedStyle = window.getComputedStyle(input);
          if (computedStyle.backgroundColor && 
              (computedStyle.backgroundColor.includes('rgb(209, 213, 219)') ||
               computedStyle.backgroundColor.includes('rgb(229, 231, 235)') ||
               computedStyle.backgroundColor.includes('rgb(243, 244, 246)') ||
               (computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                computedStyle.backgroundColor !== 'transparent' &&
                computedStyle.backgroundColor !== 'white' &&
                computedStyle.backgroundColor !== 'rgb(255, 255, 255)'))) {
            clonedEl.style.backgroundColor = '#ffffff';
          }
          
          if (clonedEl.classList.contains('p-4') || clonedEl.classList.contains('p-8')) {
            clonedEl.style.padding = '0';
          }
          if (computedStyle.padding && parseFloat(computedStyle.padding) > 0) {
            clonedEl.style.padding = '0';
          }
          
          const wrapperDivs = clonedEl.querySelectorAll('div.print-container, div[class*="bg-gray"]');
          wrapperDivs.forEach((wrapper: Element) => {
            const wrapperEl = wrapper as HTMLElement;
            wrapperEl.classList.remove('bg-gray-300', 'bg-gray-200', 'bg-gray-100');
            
            // Check inline style first, then try computed style
            const inlineBg = wrapperEl.style.backgroundColor;
            let bgColor = inlineBg;
            
            if (!bgColor || bgColor === '' || bgColor === 'transparent') {
              try {
                const wrapperComputed = clonedDoc.defaultView?.getComputedStyle(wrapperEl);
                if (wrapperComputed) {
                  bgColor = wrapperComputed.backgroundColor;
                }
              } catch (e) {
                // Fallback: set to white if we can't determine
                bgColor = '';
              }
            }
            
            if (bgColor && 
                (bgColor.includes('rgb(209, 213, 219)') ||
                 bgColor.includes('rgb(229, 231, 235)') ||
                 bgColor.includes('rgb(243, 244, 246)') ||
                 (bgColor !== 'rgba(0, 0, 0, 0)' && 
                  bgColor !== 'transparent' &&
                  bgColor !== 'white' &&
                  bgColor !== 'rgb(255, 255, 255)'))) {
              wrapperEl.style.backgroundColor = '#ffffff';
            }
            
            // Remove padding
            if (wrapperEl.classList.contains('p-4') || wrapperEl.classList.contains('p-8') || 
                wrapperEl.classList.contains('p-2') || wrapperEl.classList.contains('p-6')) {
              wrapperEl.style.padding = '0';
            } else if (wrapperEl.style.padding && parseFloat(wrapperEl.style.padding) > 0) {
              wrapperEl.style.padding = '0';
            }
          });
        }
      }
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: options.orientation || 'portrait',
      unit: 'pt',
      format: options.format || 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    // Apply margins
    const margins = options.margins || { top: 20, right: 20, bottom: 20, left: 20 };
    const contentWidth = pdfWidth - margins.left - margins.right;
    const contentHeight = pdfHeight - margins.top - margins.bottom;

    const imgWidth = contentWidth;
    const imgHeight = imgWidth / ratio;

    let heightLeft = imgHeight;
    let position = 0;
    
    // Add first page
    pdf.addImage(imgData, 'PNG', margins.left, margins.top + position, imgWidth, imgHeight, undefined, qualitySettings.compression);
    heightLeft -= contentHeight;

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', margins.left, margins.top + position, imgWidth, imgHeight, undefined, qualitySettings.compression);
      heightLeft -= contentHeight;
    }

    const fileName = generateFileName(options.fileName, 'MultiPage');
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating multi-page PDF:', error);
    throw new Error(`Failed to generate multi-page PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Enhanced function to capture computed styles for an element and its children
const captureComputedStyles = (element: HTMLElement): string => {
  let inlineStyles = '';
  
  // Function to recursively process elements
  const processElement = (el: Element) => {
    const computed = window.getComputedStyle(el);
    const styleMap: Record<string, string> = {};
    
    // Capture important computed styles
    const importantProps = [
      'font-family', 'font-size', 'font-weight', 'font-style',
      'color', 'background-color', 'background',
      'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
      'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
      'border', 'border-width', 'border-style', 'border-color',
      'width', 'height', 'min-width', 'min-height', 'max-width', 'max-height',
      'display', 'position', 'top', 'right', 'bottom', 'left',
      'text-align', 'line-height', 'white-space', 'overflow',
      'transform', 'transform-origin'
    ];
    
    importantProps.forEach(prop => {
      const value = computed.getPropertyValue(prop);
      if (value && value !== 'normal' && value !== 'auto' && value !== 'none') {
        styleMap[prop] = value;
      }
    });
    
    // Convert style map to CSS
    const styleString = Object.entries(styleMap)
      .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value}`)
      .join('; ');
    
    if (styleString) {
      inlineStyles += `#${el.id || `el-${Math.random().toString(36).substr(2, 9)}`} { ${styleString}; }\n`;
    }
    
    // Process children
    Array.from(el.children).forEach(processElement);
  };
  
  processElement(element);
  return inlineStyles;
};

// Enhanced function to capture all font-face declarations
const captureFontFaces = (): string => {
  let fontFaces = '';
  try {
    const stylesheets = Array.from(document.styleSheets);
    stylesheets.forEach(sheet => {
      try {
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule instanceof CSSFontFaceRule) {
              fontFaces += rule.cssText + '\n';
            }
          });
        }
      } catch (e) {
        // Skip CORS-protected stylesheets
      }
    });
  } catch (e) {
    console.warn('Could not capture font faces:', e);
  }
  return fontFaces;
};

// Enhanced function to capture CSS custom properties
const captureCSSVariables = (element: HTMLElement): string => {
  const computed = window.getComputedStyle(element);
  const rootComputed = window.getComputedStyle(document.documentElement);
  let cssVars = '';
  
  // Get all CSS variables
  const allStyles = rootComputed.cssText.split(';');
  allStyles.forEach(style => {
    if (style.includes('--')) {
      cssVars += `  ${style.trim()};\n`;
    }
  });
  
  if (cssVars) {
    cssVars = `:root {\n${cssVars}}\n`;
  }
  
  return cssVars;
};

// Enhanced printing functionality with better style preservation
export const printDocument = async (elementId: string, options: PrintOptions = {}): Promise<void> => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    // Detect if we're on mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    
    // Use iframe for mobile to prevent popup blocking
    if (isMobile) {
      return await printDocumentMobile(elementId, options);
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      throw new Error('Unable to open print window. Please allow popups for this site.');
    }

    // Clone the element deeply
    const clonedElement = input.cloneNode(true) as HTMLElement;
    
    // Get all stylesheets
    const stylesheets = Array.from(document.styleSheets);
    let stylesText = '';
    
    for (const stylesheet of stylesheets) {
      try {
        if (stylesheet.href) {
          stylesText += `@import url("${stylesheet.href}");\n`;
        } else if (stylesheet.ownerNode && stylesheet.ownerNode.textContent) {
          stylesText += stylesheet.ownerNode.textContent + '\n';
        }
      } catch (e) {
        // Skip stylesheets that can't be accessed due to CORS
        console.warn('Could not access stylesheet:', e);
      }
    }
    
    // Capture computed styles, font faces, and CSS variables
    const computedStyles = captureComputedStyles(input);
    const fontFaces = captureFontFaces();
    const cssVariables = captureCSSVariables(input);
    
    // Add print-specific styles with browser compatibility
    const printStyles = `
      ${fontFaces}
      ${cssVariables}
      
      @page {
        size: ${options.orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
        margin: ${options.margins === 'minimum' ? 
                 (options.orientation === 'landscape' ? '0' : '0.5in') : 
                 options.margins === 'custom' && options.customMargins ? 
                 `${options.customMargins.top}in ${options.customMargins.right}in ${options.customMargins.bottom}in ${options.customMargins.left}in` : 
                 (options.orientation === 'landscape' ? '0' : '0.75in')};
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.4;
        color: #000;
        background: white;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .print-container {
        width: 100%;
        max-width: none;
        margin: 0;
        padding: 0;
        transform: none !important;
        scale: none !important;
      }
      
      /* Reset any wrapper transforms */
      #invoice-pdf-container > div {
        transform: none !important;
      }
      
      /* Fix for invoice landscape width - use 100% for full page printing */
      #invoice-pdf {
        width: 100% !important;
        min-height: auto !important;
        max-width: 100% !important;
        transform: none !important;
        box-sizing: border-box !important;
      }
      
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        
        #invoice-pdf {
          width: 100% !important;
          max-width: 100% !important;
          transform: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Reset all transforms for tables in print */
        .invoice-table,
        .charges-table {
          transform: none !important;
          width: 100% !important;
        }
        
        .no-print {
          display: none !important;
        }
        
        .print-break-before {
          page-break-before: always !important;
        }
        
        .print-break-after {
          page-break-after: always !important;
        }
        
        .print-break-inside-avoid {
          page-break-inside: avoid !important;
        }
        
        /* Browser-specific fixes */
        @supports (-webkit-appearance: none) {
          /* WebKit browsers */
          body {
            -webkit-print-color-adjust: exact;
          }
          #invoice-pdf {
            transform: none !important;
          }
        }
        
        @supports (print-color-adjust: exact) {
          /* Modern browsers */
          body {
            print-color-adjust: exact;
          }
          #invoice-pdf {
            transform: none !important;
          }
        }
      }
      
      ${computedStyles}
    `;

    // Write the HTML content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Document</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>${stylesText}</style>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="print-container">
            ${clonedElement.outerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        
        // Close the window after printing (optional)
        printWindow.onafterprint = () => {
          setTimeout(() => {
            printWindow.close();
          }, 100);
        };
      }, 500);
    };

  } catch (error) {
    console.error('Error printing document:', error);
    throw new Error(`Failed to print document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Mobile print handler using iframe
const printDocumentMobile = async (elementId: string, options: PrintOptions = {}): Promise<void> => {
  return new Promise((resolve, reject) => {
    const input = document.getElementById(elementId);
    if (!input) {
      reject(new Error(`Element with id ${elementId} not found.`));
      return;
    }

    // Create iframe for printing
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const clonedElement = input.cloneNode(true) as HTMLElement;
    
    // Get stylesheets
    const stylesheets = Array.from(document.styleSheets);
    let stylesText = '';
    
    for (const stylesheet of stylesheets) {
      try {
        if (stylesheet.href) {
          stylesText += `@import url("${stylesheet.href}");\n`;
        } else if (stylesheet.ownerNode && stylesheet.ownerNode.textContent) {
          stylesText += stylesheet.ownerNode.textContent + '\n';
        }
      } catch (e) {
        console.warn('Could not access stylesheet:', e);
      }
    }
    
    const computedStyles = captureComputedStyles(input);
    const fontFaces = captureFontFaces();
    const cssVariables = captureCSSVariables(input);
    
    const printStyles = `
      ${fontFaces}
      ${cssVariables}
      
      @page {
        size: ${options.orientation === 'landscape' ? 'A4 landscape' : 'A4 portrait'};
        margin: ${options.margins === 'minimum' ? 
                 (options.orientation === 'landscape' ? '0' : '0.5in') : 
                 (options.orientation === 'landscape' ? '0' : '0.75in')};
      }
      
      body {
        margin: 0;
        padding: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .print-container {
        width: 100%;
        transform: none !important;
      }
      
      #invoice-pdf {
        width: 100% !important;
        min-height: auto !important;
        max-width: 100% !important;
        transform: none !important;
        box-sizing: border-box !important;
      }
      
      @media print {
        #invoice-pdf {
          width: 100% !important;
          max-width: 100% !important;
          transform: none !important;
          margin: 0 !important;
          padding: 0 !important;
        }
        
        /* Reset all transforms for tables in print */
        .invoice-table,
        .charges-table {
          transform: none !important;
          width: 100% !important;
        }
      }
      
      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
        }
      }
      
      ${computedStyles}
    `;

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) {
      document.body.removeChild(iframe);
      reject(new Error('Unable to access iframe document'));
      return;
    }

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>${stylesText}</style>
          <style>${printStyles}</style>
        </head>
        <body>
          <div class="print-container">
            ${clonedElement.outerHTML}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    iframe.onload = () => {
      setTimeout(() => {
        try {
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            resolve();
          }, 1000);
        } catch (e) {
          document.body.removeChild(iframe);
          reject(e);
        }
      }, 500);
    };
  });
};

// Generate PDF for specific document types with optimized settings
export const generateDocumentPdf = async (
  elementId: string, 
  documentType: 'invoice' | 'lorry-receipt' | 'truck-hiring-note' | 'ledger',
  documentNumber: string | number,
  date?: string
): Promise<void> => {
  const baseFileName = documentNumber;
  const fileName = generateFileName(baseFileName, documentType, documentNumber, date);
  
  // Document-specific optimizations
  const options: PDFOptions = {
    fileName,
    quality: 'high',
    useTextContent: true,
    margins: { top: 20, right: 20, bottom: 20, left: 20 }
  };

  // Set orientation based on document type
  if (documentType === 'invoice') {
    options.orientation = 'landscape';
    options.format = 'a4';
    // For invoices, use zero margins for edge-to-edge printing
    options.margins = { top: 0, right: 0, bottom: 0, left: 0 };
  } else {
    options.orientation = 'portrait';
    options.format = 'a4';
  }

  await generatePdf(elementId, options);
};

// Legacy function for backward compatibility
export const generatePdfLegacy = async (elementId: string, fileName: string): Promise<void> => {
  await generatePdf(elementId, {
    fileName,
    quality: 'high',
    orientation: 'portrait',
    format: 'a4'
  });
};

// Legacy function for backward compatibility
export const generateMultiPagePdfLegacy = async (elementId: string, fileName: string): Promise<void> => {
  await generateMultiPagePdf(elementId, {
    fileName,
    quality: 'high',
    orientation: 'portrait',
    format: 'a4'
  });
};

// Print to PDF file directly (downloads PDF without opening print dialog)
export const printToPdfFile = async (elementId: string, options: PrintOptions & { fileName?: string } = {}): Promise<void> => {
  const input = document.getElementById(elementId);
  if (!input) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    const { jsPDF, html2canvas } = await waitForLibraries();
    
    // Check if this is an invoice document
    const isInvoice = elementId.includes('invoice');
    const qualitySettings = getQualitySettings('high', isInvoice);
    
    // Wait for any animations/transitions to complete
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Ensure all transforms are removed before capture - critical for preventing corruption
    const invoiceContainer = document.getElementById('invoice-pdf-container');
    if (invoiceContainer) {
      const wrapperDiv = invoiceContainer.querySelector('div[style*="transform"]');
      if (wrapperDiv) {
        const wrapper = wrapperDiv as HTMLElement;
        const originalTransform = wrapper.style.transform;
        wrapper.style.transform = 'none';
        wrapper.style.visibility = 'hidden';
        await new Promise(resolve => setTimeout(resolve, 50));
        wrapper.style.transform = originalTransform;
        wrapper.style.visibility = 'visible';
      }
    }
    
    // Enhanced canvas options
    const canvas = await html2canvas(input, {
      scale: qualitySettings.scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: input.scrollWidth,
      height: input.scrollHeight,
      windowWidth: input.scrollWidth,
      windowHeight: input.scrollHeight,
      scrollX: 0,
      scrollY: 0,
      x: 0,
      y: 0,
      // Disable letterRendering - can cause corruption with complex layouts
      letterRendering: false,
      onclone: (clonedDoc: Document) => {
        // Ensure all styles are preserved in cloned document and clean up container styling
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          const clonedEl = clonedElement as HTMLElement;
          
          // Explicit check for invoice-pdf-container element by ID
          const invoiceContainer = clonedDoc.getElementById('invoice-pdf-container');
          if (invoiceContainer) {
            const containerEl = invoiceContainer as HTMLElement;
            // Force remove bg-gray-300, p-4 classes from container
            containerEl.classList.remove('bg-gray-300', 'bg-gray-200', 'bg-gray-100', 'p-4', 'p-8', 'p-2', 'p-6');
            // Set transparent background and remove padding/margin
            containerEl.style.backgroundColor = 'transparent';
            containerEl.style.padding = '0';
            containerEl.style.margin = '0';
            // Remove any inline padding styles
            if (containerEl.style.padding && containerEl.style.padding.includes('px')) {
              containerEl.style.padding = '0';
            }
          }
          
          // Remove grey backgrounds and padding from container elements
          clonedEl.classList.remove('bg-gray-300', 'bg-gray-200', 'bg-gray-100', 'p-4', 'p-8', 'p-2', 'p-6');
          
          const computedStyle = window.getComputedStyle(input);
          if (computedStyle.backgroundColor && 
              (computedStyle.backgroundColor.includes('rgb(209, 213, 219)') ||
               computedStyle.backgroundColor.includes('rgb(229, 231, 235)') ||
               computedStyle.backgroundColor.includes('rgb(243, 244, 246)') ||
               (computedStyle.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                computedStyle.backgroundColor !== 'transparent' &&
                computedStyle.backgroundColor !== 'white' &&
                computedStyle.backgroundColor !== 'rgb(255, 255, 255)'))) {
            clonedEl.style.backgroundColor = '#ffffff';
          }
          
          // Remove padding from containers - check all padding-related classes
          if (clonedEl.classList.contains('p-4') || clonedEl.classList.contains('p-8') || 
              clonedEl.classList.contains('p-2') || clonedEl.classList.contains('p-6')) {
            clonedEl.style.padding = '0';
          }
          if (computedStyle.padding && parseFloat(computedStyle.padding) > 0) {
            clonedEl.style.padding = '0';
          }
          // Force remove inline padding if present
          if (clonedEl.style.padding && clonedEl.style.padding.includes('px')) {
            clonedEl.style.padding = '0';
          }
          // Set margin to 0
          clonedEl.style.margin = '0';
          
          // Reset any transforms that might interfere with capture
          clonedEl.style.transform = 'none';
          
          // Remove transforms from ALL child divs to ensure preview zoom doesn't affect PDF
          // This is critical because the preview scale is applied via CSS transform on a wrapper div
          const allDivs = clonedEl.querySelectorAll('div');
          allDivs.forEach((div: Element) => {
            const divEl = div as HTMLElement;
            if (divEl.style.transform && divEl.style.transform.includes('scale')) {
              divEl.style.transform = 'none';
              divEl.style.transformOrigin = 'top center';
            }
            // Also remove any CSS transform from computed styles that might interfere
            const computedTransform = clonedDoc.defaultView?.getComputedStyle(divEl).transform;
            if (computedTransform && computedTransform !== 'none') {
              divEl.style.transform = 'none';
            }
          });
          
          // Also reset transforms in child elements (for invoice-pdf-container wrapper case)
          const innerInvoice = clonedDoc.getElementById('invoice-pdf');
          if (innerInvoice) {
            (innerInvoice as HTMLElement).style.transform = 'none';
            // For invoices, ensure proper width for landscape - use computed width from original
            if (isInvoice) {
              const originalInnerInvoice = document.getElementById('invoice-pdf');
              if (originalInnerInvoice) {
                const computedWidth = window.getComputedStyle(originalInnerInvoice).width;
                (innerInvoice as HTMLElement).style.width = computedWidth || '420mm';
              }
            }
          }
          
          // Find and clean up any print-container or wrapper divs with grey backgrounds
          const wrapperDivs = clonedEl.querySelectorAll('div.print-container, div[class*="bg-gray"]');
          wrapperDivs.forEach((wrapper: Element) => {
            const wrapperEl = wrapper as HTMLElement;
            wrapperEl.classList.remove('bg-gray-300', 'bg-gray-200', 'bg-gray-100');
            
            // Check inline style first, then try computed style
            const inlineBg = wrapperEl.style.backgroundColor;
            let bgColor = inlineBg;
            
            if (!bgColor || bgColor === '' || bgColor === 'transparent') {
              try {
                const wrapperComputed = clonedDoc.defaultView?.getComputedStyle(wrapperEl);
                if (wrapperComputed) {
                  bgColor = wrapperComputed.backgroundColor;
                }
              } catch (e) {
                // Fallback: set to white if we can't determine
                bgColor = '';
              }
            }
            
            if (bgColor && 
                (bgColor.includes('rgb(209, 213, 219)') ||
                 bgColor.includes('rgb(229, 231, 235)') ||
                 bgColor.includes('rgb(243, 244, 246)') ||
                 (bgColor !== 'rgba(0, 0, 0, 0)' && 
                  bgColor !== 'transparent' &&
                  bgColor !== 'white' &&
                  bgColor !== 'rgb(255, 255, 255)'))) {
              wrapperEl.style.backgroundColor = '#ffffff';
            }
            
            // Remove padding
            if (wrapperEl.classList.contains('p-4') || wrapperEl.classList.contains('p-8') || 
                wrapperEl.classList.contains('p-2') || wrapperEl.classList.contains('p-6')) {
              wrapperEl.style.padding = '0';
            } else if (wrapperEl.style.padding && parseFloat(wrapperEl.style.padding) > 0) {
              wrapperEl.style.padding = '0';
            }
          });
          
          // Apply important styles that might be lost
          clonedEl.style.width = computedStyle.width;
          clonedEl.style.height = computedStyle.height;
          // For invoices, preserve the computed width and ensure full-page settings
          if (isInvoice) {
            if (computedStyle.width) {
              clonedEl.style.width = computedStyle.width;
            } else {
              // Set to full A4 landscape width if not computed
              clonedEl.style.width = '420mm';
            }
            // Ensure container has no background and no padding for full-page printing
            clonedEl.style.backgroundColor = 'transparent';
            clonedEl.style.padding = '0';
            clonedEl.style.margin = '0';
          }
        }
      }
    });
    
    // Validate canvas before proceeding
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendering failed: invalid dimensions');
    }
    
    // Check for canvas size limits
    const maxDimension = 16384;
    if (canvas.width > maxDimension || canvas.height > maxDimension) {
      console.warn('Canvas size exceeds browser limits, reducing scale and retrying...');
      // Retry with lower scale
      const reducedScale = Math.max(1, qualitySettings.scale * 0.7);
      const retryCanvas = await html2canvas(input, {
        scale: reducedScale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: input.scrollWidth,
        height: input.scrollHeight,
        windowWidth: input.scrollWidth,
        windowHeight: input.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
        letterRendering: false,
      });
      
      if (!retryCanvas || retryCanvas.width === 0 || retryCanvas.height === 0) {
        throw new Error('Canvas rendering failed after scale reduction');
      }
      
      // Use the retry canvas instead
      const imgData = retryCanvas.toDataURL('image/png', 0.95);
      
      const orientation = options.orientation || 'portrait';
      const format = 'a4';
      
      const pdf = new jsPDF({
        orientation,
        unit: 'pt',
        format,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasWidth = retryCanvas.width;
      const canvasHeight = retryCanvas.height;

      const margins = isInvoice && orientation === 'landscape' 
        ? { top: 0, right: 0, bottom: 0, left: 0 }
        : { top: 20, right: 20, bottom: 20, left: 20 };
      const contentWidth = pdfWidth - margins.left - margins.right;
      const contentHeight = pdfHeight - margins.top - margins.bottom;

      const widthRatio = contentWidth / canvasWidth;
      const heightRatio = contentHeight / canvasHeight;
      const scale = Math.min(widthRatio, heightRatio);
      
      let imgWidth = canvasWidth * scale;
      let imgHeight = canvasHeight * scale;

      const x = margins.left + (contentWidth - imgWidth) / 2;
      const y = margins.top + (contentHeight - imgHeight) / 2;

      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, qualitySettings.compression);
      
      let heightLeft = imgHeight - contentHeight;
      let pageNumber = 1;
      
      while (heightLeft > 0 && pageNumber < 50) {
        pdf.addPage();
        const newY = -contentHeight * pageNumber;
        pdf.addImage(imgData, 'PNG', x, newY, imgWidth, imgHeight, undefined, qualitySettings.compression);
        heightLeft -= contentHeight;
        pageNumber++;
      }
      
      const fileName = options.fileName || `document_${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
      return;
    }
    
    const imgData = canvas.toDataURL('image/png', 0.95);
    
    // Determine orientation and format
    const orientation = options.orientation || 'portrait';
    const format = 'a4';
    
    // Create PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'pt',
      format,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    // Handle landscape properly - especially for invoices
    // Use zero margins for edge-to-edge printing
    const margins = isInvoice && orientation === 'landscape' 
      ? { top: 0, right: 0, bottom: 0, left: 0 }
      : { top: 20, right: 20, bottom: 20, left: 20 };
    const contentWidth = pdfWidth - margins.left - margins.right;
    const contentHeight = pdfHeight - margins.top - margins.bottom;

    // For landscape invoices, scale to fill entire page edge-to-edge
    // Calculate scale to fit both width and height while maintaining aspect ratio
    const widthRatio = contentWidth / canvasWidth;
    const heightRatio = contentHeight / canvasHeight;
    const scale = Math.min(widthRatio, heightRatio);
    
    let imgWidth = canvasWidth * scale;
    let imgHeight = canvasHeight * scale;

    // Center the content (or align to edges for edge-to-edge)
    const x = margins.left + (contentWidth - imgWidth) / 2;
    const y = margins.top + (contentHeight - imgHeight) / 2;

    // Add image to PDF
    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight, undefined, qualitySettings.compression);
    
    // Handle multi-page if content exceeds page height
    let heightLeft = imgHeight - contentHeight;
    let pageNumber = 1;
    
    while (heightLeft > 0 && pageNumber < 50) { // Max 50 pages safety limit
      pdf.addPage();
      const newY = -contentHeight * pageNumber;
      pdf.addImage(imgData, 'PNG', x, newY, imgWidth, imgHeight, undefined, qualitySettings.compression);
      heightLeft -= contentHeight;
      pageNumber++;
    }
    
    // Generate filename
    const fileName = options.fileName || `document_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF file:', error);
    throw new Error(`Failed to generate PDF file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};