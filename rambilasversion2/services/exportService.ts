// Enhanced Export Service with multiple formats and advanced features

export interface ExportOptions {
    format: 'csv' | 'xlsx' | 'json' | 'pdf' | 'zip' | 'xml';
    filename: string;
    includeHeaders?: boolean;
    dateRange?: {
        start: Date;
        end: Date;
    };
    filters?: Record<string, any>;
    customFields?: string[];
    template?: string;
    compression?: boolean;
    jsonFormat?: 'standard' | 'gst' | 'tax'; // Enhanced JSON formatting options
    xmlFormat?: 'gstr1' | 'gstr3b' | 'standard'; // XML formatting options
}

export interface ExportProgress {
    stage: 'preparing' | 'processing' | 'generating' | 'compressing' | 'uploading' | 'completed' | 'error';
    progress: number; // 0-100
    message: string;
    estimatedTime?: number; // seconds
}

export interface ExportTemplate {
    id: string;
    name: string;
    description: string;
    dataTypes: ('customers' | 'lorryReceipts' | 'invoices' | 'truckHiringNotes' | 'payments')[];
    fields: string[];
    format: 'csv' | 'json' | 'xlsx' | 'zip';
    filters: Record<string, any>;
    isDefault?: boolean;
}

// CSV Conversion
const convertToCSV = (data: object[]): string => {
    if (!data || data.length === 0) {
        return '';
    }
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
        const values = headers.map(header => {
            let cell = (row as any)[header];
            if (cell === null || cell === undefined) {
                cell = '';
            } else {
                cell = String(cell);
            }
            // Escape quotes by doubling them and wrap in quotes if it contains a comma, quote, or newline
            if (cell.includes('"') || cell.includes(',') || cell.includes('\n')) {
                cell = `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
};

// JSON Conversion with enhanced formatting for GST/Income Tax
const convertToJSON = (data: object[], options?: { format?: 'standard' | 'gst' | 'tax' }): string => {
    if (options?.format === 'gst' || options?.format === 'tax') {
        // Enhanced JSON structure for GST/Tax filing
        const enhancedData = data.map(item => {
            const enhancedItem: any = { ...item };
            
            // Add GST-specific fields if they exist
            if ('gstType' in item) {
                enhancedItem.gstDetails = {
                    gstType: (item as any).gstType,
                    cgstRate: (item as any).cgstRate || 0,
                    sgstRate: (item as any).sgstRate || 0,
                    igstRate: (item as any).igstRate || 0,
                    cgstAmount: (item as any).cgstAmount || 0,
                    sgstAmount: (item as any).sgstAmount || 0,
                    igstAmount: (item as any).igstAmount || 0,
                    isRcm: (item as any).isRcm || false,
                    isManualGst: (item as any).isManualGst || false
                };
            }
            
            // Add financial summary
            if ('totalAmount' in item || 'amount' in item) {
                enhancedItem.financialSummary = {
                    totalAmount: (item as any).totalAmount || (item as any).amount || 0,
                    grandTotal: (item as any).grandTotal || (item as any).totalAmount || (item as any).amount || 0,
                    status: (item as any).status || 'Unknown'
                };
            }
            
            // Add customer details if available
            if ('customer' in item && (item as any).customer) {
                enhancedItem.customerDetails = {
                    name: (item as any).customer.name,
                    gstin: (item as any).customer.gstin,
                    state: (item as any).customer.state,
                    address: (item as any).customer.address
                };
            }
            
            // Add export metadata
            enhancedItem.exportMetadata = {
                exportedAt: new Date().toISOString(),
                exportType: options.format,
                version: '1.0'
            };
            
            return enhancedItem;
        });
        
        const exportStructure = {
            exportInfo: {
                generatedAt: new Date().toISOString(),
                format: options.format,
                version: '1.0',
                purpose: options.format === 'gst' ? 'GST Filing' : 'Income Tax Filing',
                totalRecords: enhancedData.length
            },
            data: enhancedData,
            summary: {
                totalAmount: enhancedData.reduce((sum, item) => {
                    return sum + ((item as any).totalAmount || (item as any).amount || 0);
                }, 0),
                recordCount: enhancedData.length,
                dateRange: {
                    start: enhancedData.length > 0 ? Math.min(...enhancedData.map(item => new Date((item as any).date).getTime())) : null,
                    end: enhancedData.length > 0 ? Math.max(...enhancedData.map(item => new Date((item as any).date).getTime())) : null
                }
            }
        };
        
        return JSON.stringify(exportStructure, null, 2);
    }
    
    // Standard JSON format
    return JSON.stringify(data, null, 2);
};

// Excel Conversion (simplified - will be enhanced later)
const convertToExcel = async (data: object[]): Promise<Blob> => {
    try {
        // For now, return CSV as Excel - will be enhanced with proper Excel support
        const csvString = convertToCSV(data);
        return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    } catch (error) {
        console.error('Excel conversion failed:', error);
        const csvString = convertToCSV(data);
        return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    }
};

// XML Conversion with GST-specific formats
const convertToXML = (data: object[], options?: { format?: 'gstr1' | 'gstr3b' | 'standard' }): string => {
    if (options?.format === 'gstr1') {
        return convertToGSTR1XML(data);
    } else if (options?.format === 'gstr3b') {
        return convertToGSTR3BXML(data);
    } else {
        return convertToStandardXML(data);
    }
};

// GSTR-1 XML format
const convertToGSTR1XML = (data: object[]): string => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const gstHeader = '<GSTReturn xmlns="urn:gst:gstreturn:1.0">';
    const gstFooter = '</GSTReturn>';
    
    // This is a simplified GSTR-1 structure - in production, you'd need the exact GST schema
    const b2bSection = data.map(item => {
        const inv = item as any;
        return `
        <B2B>
            <ctin>${inv.customer?.gstin || ''}</ctin>
            <cname>${inv.customer?.name || ''}</cname>
            <inv>
                <inum>${inv.invoiceNumber || ''}</inum>
                <idt>${inv.date || ''}</idt>
                <val>${inv.grandTotal || 0}</val>
                <pos>${inv.customer?.state || ''}</pos>
                <rchrg>N</rchrg>
                <inv_typ>R</inv_typ>
                <itms>
                    <itm>
                        <rt>${(inv.cgstRate || 0) + (inv.sgstRate || 0) + (inv.igstRate || 0)}</rt>
                        <txval>${inv.totalAmount || 0}</txval>
                        <iamt>${(inv.cgstAmount || 0) + (inv.sgstAmount || 0)}</iamt>
                        <camt>${inv.cgstAmount || 0}</camt>
                        <samt>${inv.sgstAmount || 0}</samt>
                        <csamt>0</csamt>
                    </itm>
                </itms>
            </inv>
        </B2B>`;
    }).join('');

    return `${xmlHeader}\n${gstHeader}\n${b2bSection}\n${gstFooter}`;
};

// GSTR-3B XML format
const convertToGSTR3BXML = (data: object[]): string => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const gstHeader = '<GSTReturn xmlns="urn:gst:gstreturn:1.0">';
    const gstFooter = '</GSTReturn>';
    
    // Calculate totals
    const totalTaxableValue = data.reduce((sum, item) => sum + ((item as any).totalAmount || 0), 0);
    const totalCGST = data.reduce((sum, item) => sum + ((item as any).cgstAmount || 0), 0);
    const totalSGST = data.reduce((sum, item) => sum + ((item as any).sgstAmount || 0), 0);
    const totalIGST = data.reduce((sum, item) => sum + ((item as any).igstAmount || 0), 0);
    
    // This is a simplified GSTR-3B structure
    const gstr3bContent = `
    <GSTR3B>
        <sup_details>
            <osup_det>
                <ty>G</ty>
                <typ>B2B</typ>
                <txval>${totalTaxableValue}</txval>
                <iamt>${totalCGST + totalSGST}</iamt>
                <camt>${totalCGST}</camt>
                <samt>${totalSGST}</samt>
                <csamt>0</csamt>
            </osup_det>
        </sup_details>
    </GSTR3B>`;

    return `${xmlHeader}\n${gstHeader}\n${gstr3bContent}\n${gstFooter}`;
};

// Standard XML format
const convertToStandardXML = (data: object[]): string => {
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
    const rootStart = '<data>';
    const rootEnd = '</data>';
    
    const items = data.map((item, index) => {
        const itemXml = Object.entries(item).map(([key, value]) => {
            const cleanKey = key.replace(/[^a-zA-Z0-9_]/g, '_');
            return `    <${cleanKey}>${value}</${cleanKey}>`;
        }).join('\n');
        
        return `  <item id="${index}">\n${itemXml}\n  </item>`;
    }).join('\n');

    return `${xmlHeader}\n${rootStart}\n${items}\n${rootEnd}`;
};

// ZIP Creation (simplified - will be enhanced later)
const createZip = async (files: { name: string; content: Blob }[]): Promise<Blob> => {
    try {
        // For now, return the first file - will be enhanced with proper ZIP support
        if (files.length > 0) {
            return files[0].content;
        }
        throw new Error('No files to create ZIP from');
    } catch (error) {
        console.error('ZIP creation failed:', error);
        if (files.length > 0) {
            return files[0].content;
        }
        throw new Error('ZIP creation failed and no files to fallback to');
    }
};

// File Download Utility
const downloadFile = (blob: Blob, filename: string, mimeType: string): void => {
        const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Progress Callback Type
export type ProgressCallback = (progress: ExportProgress) => void;

// Enhanced Export Function
export const exportData = async (
    data: object[], 
    options: ExportOptions, 
    onProgress?: ProgressCallback
): Promise<void> => {
    if (!data || data.length === 0) {
        throw new Error("No data available to export.");
    }

    try {
        onProgress?.({
            stage: 'preparing',
            progress: 10,
            message: 'Preparing data for export...'
        });

        // Apply filters if provided
        let filteredData = data;
        if (options.filters) {
            filteredData = data.filter(item => {
                return Object.entries(options.filters).every(([key, value]) => {
                    if (value === null || value === undefined) return true;
                    return (item as any)[key] === value;
                });
            });
        }

        // Apply date range filter if provided
        if (options.dateRange) {
            filteredData = filteredData.filter(item => {
                const itemDate = new Date((item as any).date);
                return itemDate >= options.dateRange!.start && itemDate <= options.dateRange!.end;
            });
        }

        // Select custom fields if provided
        if (options.customFields && options.customFields.length > 0) {
            filteredData = filteredData.map(item => {
                const filteredItem: any = {};
                options.customFields!.forEach(field => {
                    filteredItem[field] = (item as any)[field];
                });
                return filteredItem;
            });
        }

        onProgress?.({
            stage: 'processing',
            progress: 30,
            message: 'Processing data...'
        });

        let blob: Blob;
        let mimeType: string;
        let extension: string;

        switch (options.format) {
            case 'csv':
                const csvString = convertToCSV(filteredData);
                blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
                mimeType = 'text/csv';
                extension = 'csv';
                break;

            case 'json':
                const jsonString = convertToJSON(filteredData, { format: options.jsonFormat || 'standard' });
                blob = new Blob([jsonString], { type: 'application/json' });
                mimeType = 'application/json';
                extension = 'json';
                break;

            case 'xlsx':
                onProgress?.({
                    stage: 'generating',
                    progress: 50,
                    message: 'Generating Excel file...'
                });
                blob = await convertToExcel(filteredData);
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                extension = 'xlsx';
                break;

            case 'pdf':
                // This would integrate with your existing PDF service
                throw new Error('PDF export not implemented yet');

            case 'xml':
                onProgress?.({
                    stage: 'generating',
                    progress: 50,
                    message: 'Generating XML file...'
                });
                const xmlString = convertToXML(filteredData, { format: options.xmlFormat || 'standard' });
                blob = new Blob([xmlString], { type: 'application/xml;charset=utf-8;' });
                mimeType = 'application/xml';
                extension = 'xml';
                break;

            case 'zip':
                onProgress?.({
                    stage: 'compressing',
                    progress: 60,
                    message: 'Creating compressed archive...'
                });
                const files = [{
                    name: `${options.filename}.csv`,
                    content: new Blob([convertToCSV(filteredData)], { type: 'text/csv' })
                }];
                blob = await createZip(files);
                mimeType = 'application/zip';
                extension = 'zip';
                break;

            default:
                throw new Error(`Unsupported export format: ${options.format}`);
        }

        onProgress?.({
            stage: 'completed',
            progress: 100,
            message: 'Export completed successfully!'
        });

        const finalFilename = `${options.filename}.${extension}`;
        downloadFile(blob, finalFilename, mimeType);

    } catch (error) {
        onProgress?.({
            stage: 'error',
            progress: 0,
            message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
        throw error;
    }
};

// Legacy CSV Export (for backward compatibility)
export const exportToCsv = (filename: string, data: object[]) => {
    exportData(data, {
        format: 'csv',
        filename,
        includeHeaders: true
    }).catch(error => {
        console.error('CSV export failed:', error);
        alert("Export failed. Please try again.");
    });
};

// Bulk Export Function
export const exportBulkData = async (
    dataSets: { name: string; data: object[]; options: Partial<ExportOptions> }[],
    masterOptions: ExportOptions,
    onProgress?: ProgressCallback
): Promise<void> => {
    const files: { name: string; content: Blob }[] = [];
    
    for (let i = 0; i < dataSets.length; i++) {
        const dataSet = dataSets[i];
        const options = { ...masterOptions, ...dataSet.options };
        
        onProgress?.({
            stage: 'processing',
            progress: (i / dataSets.length) * 80,
            message: `Processing ${dataSet.name}...`
        });

        let blob: Blob;
        switch (options.format) {
            case 'csv':
                blob = new Blob([convertToCSV(dataSet.data)], { type: 'text/csv' });
                break;
            case 'json':
                blob = new Blob([convertToJSON(dataSet.data, { format: options.jsonFormat || 'standard' })], { type: 'application/json' });
                break;
            case 'xlsx':
                blob = await convertToExcel(dataSet.data);
                break;
            default:
                throw new Error(`Unsupported format for bulk export: ${options.format}`);
        }

        files.push({
            name: `${dataSet.name}.${options.format === 'xlsx' ? 'xlsx' : options.format}`,
            content: blob
        });
    }

    onProgress?.({
        stage: 'compressing',
        progress: 90,
        message: 'Creating archive...'
    });

    const zipBlob = await createZip(files);
    downloadFile(zipBlob, `${masterOptions.filename}.zip`, 'application/zip');

    onProgress?.({
        stage: 'completed',
        progress: 100,
        message: 'Bulk export completed!'
    });
};

// Export Templates
export const getExportTemplates = (): ExportTemplate[] => [
    {
        id: 'all-data',
        name: 'Complete Data Export',
        description: 'Export all data types in a single archive',
        dataTypes: ['customers', 'lorryReceipts', 'invoices', 'truckHiringNotes', 'payments'],
        fields: ['*'],
        format: 'zip',
        filters: {},
        isDefault: true
    },
    {
        id: 'gst-filing',
        name: 'GST Filing Export',
        description: 'Export data in GST-compliant JSON format for tax filing',
        dataTypes: ['invoices', 'lorryReceipts'],
        fields: ['*'],
        format: 'json',
        filters: {},
        isDefault: false
    },
    {
        id: 'income-tax',
        name: 'Income Tax Export',
        description: 'Export financial data in JSON format for income tax filing',
        dataTypes: ['invoices', 'payments', 'truckHiringNotes'],
        fields: ['*'],
        format: 'json',
        filters: {},
        isDefault: false
    },
    {
        id: 'financial-summary',
        name: 'Financial Summary',
        description: 'Export financial data with summaries',
        dataTypes: ['invoices', 'payments'],
        fields: ['date', 'amount', 'status', 'customer'],
        format: 'xlsx',
        filters: {}
    },
    {
        id: 'lorry-receipts-detailed',
        name: 'Detailed Lorry Receipts',
        description: 'Export LRs with all related information',
        dataTypes: ['lorryReceipts'],
        fields: ['*'],
        format: 'xlsx',
        filters: {}
    },
    {
        id: 'customer-ledger',
        name: 'Customer Ledger',
        description: 'Export customer-wise transaction ledger',
        dataTypes: ['lorryReceipts', 'invoices', 'payments'],
        fields: ['date', 'customer', 'type', 'amount', 'balance'],
        format: 'xlsx',
        filters: {}
    }
];

// Data Validation
export const validateExportData = (data: object[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!data || data.length === 0) {
        errors.push('No data to export');
        return { isValid: false, errors };
    }

    // Check for required fields - use _id instead of id since that's what our data structures use
    const requiredFields = ['date', '_id'];
    const sampleItem = data[0];
    const missingFields = requiredFields.filter(field => !(field in sampleItem));
    
    if (missingFields.length > 0) {
        errors.push(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Check for data consistency
    const dateFields = data.filter(item => {
        const date = (item as any).date;
        return date && isNaN(new Date(date).getTime());
    });
    
    if (dateFields.length > 0) {
        errors.push(`${dateFields.length} records have invalid dates`);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};