import React, { useState } from 'react';
import type { CompanyInfo } from '../types';
import { generateDocumentPdf, printDocument } from '../services/pdfService';
import { Button } from './ui/Button';
import { Logo } from './ui/Logo';
import { PrintStyles } from './ui/PrintStyles';
import { PDFViewer, usePDFViewer } from './ui/PDFViewer';
import { formatDate } from '../services/utils';

// This component will be flexible enough to render either a Client or Company Ledger
interface LedgerPDFProps {
    title: string;
    transactions: any[]; // Using 'any' for flexibility between client/company ledger data structures
    columns: { key: string, label: string, align?: 'right' | 'left' | 'center' }[];
    companyInfo: CompanyInfo;
    summary?: { label: string, value: string | number, color?: string }[];
    onBack: () => void;
}

export const LedgerView: React.FC<Omit<LedgerPDFProps, 'title' | 'onBack'>> = ({ transactions, columns, companyInfo, summary }) => {
    return (
        <div id="ledger-pdf" className="bg-white p-8 text-sm font-sans" style={{ width: '210mm', minHeight: '297mm' }}>
            <div className="w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center mb-4">
                        <Logo 
                            size="xl" 
                            showText={true} 
                            className="justify-center"
                            companyLogo={companyInfo?.logo}
                            companyName={companyInfo?.name}
                        />
                    </div>
                    <h1 className="text-3xl font-bold tracking-wider text-gray-800">{companyInfo?.name || 'Company Name'}</h1>
                    <p className="text-gray-600">{companyInfo?.address || 'Company Address'}</p>
                    <h2 className="text-2xl font-semibold mt-4 underline">{summary ? 'Ledger Report' : 'Company Ledger'}</h2>
                </div>

                {/* Summary Details */}
                {summary && (
                    <div className="border-t border-b border-gray-400 py-4 mb-4">
                        {summary.map(item => (
                            <p key={item.label}>
                                <span className="font-bold w-24 inline-block">{item.label}:</span>
                                <span className={item.color || ''}>{item.value}</span>
                            </p>
                        ))}
                    </div>
                )}

                {/* Transactions Table */}
                <table className="w-full text-left text-xs mb-4 border-collapse border border-gray-400">
                    <thead className="bg-gray-100">
                        <tr className="border-b-2 border-black">
                            {columns.map(col => (
                                <th key={col.key} className={`p-2 border border-gray-300 text-${col.align || 'left'}`}>
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx, index) => (
                            <tr key={index} className="border-b border-gray-300">
                                {columns.map(col => (
                                    <td key={col.key} className={`p-2 border border-gray-300 text-${col.align || 'left'}`}>
                                        {tx[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                         {transactions.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} className="text-center p-4 text-gray-500">No transactions to display.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


export const LedgerPDF: React.FC<LedgerPDFProps> = (props) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);
    const { openViewer, PDFViewerComponent } = usePDFViewer();

    const handleGeneratePdf = async () => {
        setIsGenerating(true);
        try {
            await generateDocumentPdf(
                'ledger-pdf-container', 
                'ledger', 
                props.title.replace(/\s+/g, '_'),
                new Date().toISOString().split('T')[0]
            );
        } catch (error) {
            console.error('PDF generation failed:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = async () => {
        setIsPrinting(true);
        try {
            await printDocument('ledger-pdf-container', {
                orientation: 'portrait',
                scale: 'fit',
                margins: 'minimum'
            });
        } catch (error) {
            console.error('Print failed:', error);
            alert('Failed to print. Please try again.');
        } finally {
            setIsPrinting(false);
        }
    };

    const handleViewPdf = async () => {
        try {
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            if (printWindow) {
                const element = document.getElementById('ledger-pdf-container');
                if (element) {
                    const clonedElement = element.cloneNode(true) as HTMLElement;
                    printWindow.document.write(`
                        <!DOCTYPE html>
                        <html>
                            <head>
                                <title>${props.title} Ledger</title>
                                <style>
                                    body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
                                    @page { size: A4 portrait; margin: 0.5in; }
                                </style>
                            </head>
                            <body>
                                ${clonedElement.outerHTML}
                            </body>
                        </html>
                    `);
                    printWindow.document.close();
                }
            }
        } catch (error) {
            console.error('PDF view failed:', error);
            alert('Failed to open PDF viewer. Please try downloading instead.');
        }
    };

    return (
        <div>
            <PrintStyles documentType="ledger" orientation="portrait" />
            <div className="mb-4 flex justify-end no-print print-controls">
                <Button 
                    onClick={handleViewPdf} 
                    className="mr-2"
                    variant="secondary"
                >
                    View PDF
                </Button>
                <Button 
                    onClick={handlePrint} 
                    className="mr-2"
                    variant="secondary"
                    disabled={isPrinting}
                >
                    {isPrinting ? 'Printing...' : 'Print'}
                </Button>
                <Button 
                    onClick={handleGeneratePdf} 
                    className="mr-2"
                    disabled={isGenerating}
                >
                    {isGenerating ? 'Generating PDF...' : 'Download PDF'}
                </Button>
                <Button variant="secondary" onClick={props.onBack}>Back</Button>
            </div>
            <div id="ledger-pdf-container" className="print-container flex justify-center bg-gray-300 p-8">
                <LedgerView {...props} />
            </div>
            <PDFViewerComponent />
        </div>
    );
}
