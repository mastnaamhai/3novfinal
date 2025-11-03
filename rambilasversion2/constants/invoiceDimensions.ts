// Invoice dimensions configuration
// A4 landscape: 420mm × 297mm
// A3 landscape: 594mm × 420mm
// Custom: Set to desired width (e.g., 500mm, 550mm, 600mm)

/**
 * Invoice width - set to A4 landscape width for proper auto-fitting
 * Default: 420mm (A4 landscape width)
 */
export const INVOICE_WIDTH = '420mm';

/**
 * Invoice height - standard landscape height
 * Default: 297mm (standard A4 landscape height)
 */
export const INVOICE_HEIGHT = '297mm';

/**
 * Calculate approximate pixel width at 96 DPI
 * Used for preview calculations
 */
export const getInvoiceWidthPx = (): number => {
  // Convert mm to pixels at 96 DPI
  // 1mm = 3.779527559 pixels at 96 DPI
  const widthMm = parseFloat(INVOICE_WIDTH.replace('mm', ''));
  return Math.round(widthMm * 3.779527559);
};

