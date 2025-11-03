import React, { useState } from 'react';
import type { LorryReceipt, Invoice, Payment, Customer, TruckHiringNote } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface GSTReturnsProps {
  lorryReceipts: LorryReceipt[];
  invoices: Invoice[];
  payments: Payment[];
  customers: Customer[];
  truckHiringNotes: TruckHiringNote[];
}

export const GSTReturns: React.FC<GSTReturnsProps> = (props) => {
  const [selectedPeriod, setSelectedPeriod] = useState('current-month');
  const [isExporting, setIsExporting] = useState(false);

  const handleExportGSTR1 = async (format: 'xml' | 'csv') => {
    setIsExporting(true);
    try {
      // Filter invoices for the selected period
      const filteredInvoices = filterInvoicesByPeriod(props.invoices, selectedPeriod);
      
      if (format === 'xml') {
        await exportGSTR1XML(filteredInvoices);
      } else {
        await exportGSTR1CSV(filteredInvoices);
      }
    } catch (error) {
      console.error('Error exporting GSTR-1:', error);
      alert('Error exporting GSTR-1. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportGSTR3B = async (format: 'xml' | 'excel') => {
    setIsExporting(true);
    try {
      // Filter invoices for the selected period
      const filteredInvoices = filterInvoicesByPeriod(props.invoices, selectedPeriod);
      
      if (format === 'xml') {
        await exportGSTR3BXML(filteredInvoices);
      } else {
        await exportGSTR3BExcel(filteredInvoices);
      }
    } catch (error) {
      console.error('Error exporting GSTR-3B:', error);
      alert('Error exporting GSTR-3B. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getDateRangeForPeriod = (period: string) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (period) {
      case 'current-month':
        const currentMonthStart = new Date(currentYear, currentMonth, 1);
        const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
        return { start: currentMonthStart, end: currentMonthEnd };
      
      case 'last-month':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const lastMonthStart = new Date(lastMonthYear, lastMonth, 1);
        const lastMonthEnd = new Date(lastMonthYear, lastMonth + 1, 0);
        return { start: lastMonthStart, end: lastMonthEnd };
      
      case 'current-quarter':
        const currentQuarter = Math.floor(currentMonth / 3);
        const quarterStartMonth = currentQuarter * 3;
        const quarterStart = new Date(currentYear, quarterStartMonth, 1);
        const quarterEnd = new Date(currentYear, quarterStartMonth + 3, 0);
        return { start: quarterStart, end: quarterEnd };
      
      case 'current-year':
        const yearStart = new Date(currentYear, 0, 1);
        const yearEnd = new Date(currentYear, 11, 31);
        return { start: yearStart, end: yearEnd };
      
      default:
        return null;
    }
  };

  const filterInvoicesByPeriod = (invoices: Invoice[], period: string) => {
    const dateRange = getDateRangeForPeriod(period);
    if (!dateRange) return invoices;

    return invoices.filter(inv => {
      const invDate = new Date(inv.date);
      return invDate >= dateRange.start && invDate <= dateRange.end;
    });
  };

  const formatDateRange = (period: string) => {
    const dateRange = getDateRangeForPeriod(period);
    if (!dateRange) return 'All Time';

    const startStr = dateRange.start.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const endStr = dateRange.end.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });

    return `${startStr} - ${endStr}`;
  };

  const exportGSTR1XML = async (invoices: Invoice[]) => {
    try {
      const { exportData } = await import('../../services/exportService');
      
      const dateRange = getDateRangeForPeriod(selectedPeriod);
      const periodSuffix = dateRange 
        ? `${dateRange.start.toISOString().split('T')[0]}-to-${dateRange.end.toISOString().split('T')[0]}`
        : selectedPeriod;
      
      await exportData(invoices, {
        format: 'xml',
        filename: `GSTR-1-${periodSuffix}`,
        xmlFormat: 'gstr1'
      });
    } catch (error) {
      console.error('Error exporting GSTR-1 XML:', error);
      alert('Error exporting GSTR-1 XML. Please try again.');
    }
  };

  const exportGSTR1CSV = async (invoices: Invoice[]) => {
    const data = invoices.map(inv => ({
      'Invoice No': inv.invoiceNumber,
      'Date': inv.date,
      'Customer Name': inv.customer?.name || '',
      'Customer GSTIN': inv.customer?.gstin || '',
      'Place of Supply': inv.customer?.state || '',
      'SAC Code': '9965', // Default transport service code
      'Taxable Amount': inv.totalAmount,
      'CGST Rate': inv.cgstRate,
      'CGST Amount': inv.cgstAmount,
      'SGST Rate': inv.sgstRate,
      'SGST Amount': inv.sgstAmount,
      'IGST Rate': inv.igstRate,
      'IGST Amount': inv.igstAmount,
      'Total Amount': inv.grandTotal,
      'Invoice Type': 'B2B' // Default to B2B for registered customers
    }));

    const csvContent = convertToCSV(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateRange = getDateRangeForPeriod(selectedPeriod);
    const periodSuffix = dateRange 
      ? `${dateRange.start.toISOString().split('T')[0]}-to-${dateRange.end.toISOString().split('T')[0]}`
      : selectedPeriod;
    
    link.download = `GSTR-1-${periodSuffix}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportGSTR3BXML = async (invoices: Invoice[]) => {
    try {
      const { exportData } = await import('../../services/exportService');
      
      const dateRange = getDateRangeForPeriod(selectedPeriod);
      const periodSuffix = dateRange 
        ? `${dateRange.start.toISOString().split('T')[0]}-to-${dateRange.end.toISOString().split('T')[0]}`
        : selectedPeriod;
      
      await exportData(invoices, {
        format: 'xml',
        filename: `GSTR-3B-${periodSuffix}`,
        xmlFormat: 'gstr3b'
      });
    } catch (error) {
      console.error('Error exporting GSTR-3B XML:', error);
      alert('Error exporting GSTR-3B XML. Please try again.');
    }
  };

  const exportGSTR3BExcel = async (invoices: Invoice[]) => {
    // TODO: Implement Excel export for GSTR-3B
    console.warn('GSTR-3B Excel export will be implemented soon. For now, use CSV format.');
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const currentMonthInvoices = filterInvoicesByPeriod(props.invoices, selectedPeriod);
  const totalTaxableAmount = currentMonthInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalCGST = currentMonthInvoices.reduce((sum, inv) => sum + (inv.cgstAmount || 0), 0);
  const totalSGST = currentMonthInvoices.reduce((sum, inv) => sum + (inv.sgstAmount || 0), 0);
  const totalIGST = currentMonthInvoices.reduce((sum, inv) => sum + (inv.igstAmount || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800">GST Returns</h3>
        <p className="text-gray-600 mt-1">Generate GSTR-1 and GSTR-3B files for GST filing</p>
      </div>

      {/* Period Selection */}
      <Card title="Select Period">
        <div className="space-y-4">
          <Select
            label="Reporting Period"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="current-month">Current Month</option>
            <option value="last-month">Last Month</option>
            <option value="current-quarter">Current Quarter</option>
            <option value="current-year">Current Year</option>
            <option value="all">All Time</option>
          </Select>
          
          {/* Date Range Display */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h4 className="font-medium text-blue-800">Selected Date Range</h4>
            </div>
            <p className="text-lg font-semibold text-blue-900">
              {formatDateRange(selectedPeriod)}
            </p>
            {selectedPeriod !== 'all' && (
              <p className="text-sm text-blue-700 mt-1">
                {(() => {
                  const dateRange = getDateRangeForPeriod(selectedPeriod);
                  if (!dateRange) return '';
                  const daysDiff = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                  return `${daysDiff} days`;
                })()}
              </p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Summary for Selected Period</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Invoices:</span>
                <span className="font-medium ml-2">{currentMonthInvoices.length}</span>
                {props.invoices.length > 0 && (
                  <span className="text-xs text-gray-500 ml-1">
                    (of {props.invoices.length} total)
                  </span>
                )}
              </div>
              <div>
                <span className="text-gray-600">Taxable Amount:</span>
                <span className="font-medium ml-2">₹{totalTaxableAmount.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-gray-600">CGST:</span>
                <span className="font-medium ml-2">₹{totalCGST.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-gray-600">SGST:</span>
                <span className="font-medium ml-2">₹{totalSGST.toLocaleString('en-IN')}</span>
              </div>
            </div>
            
            {/* Invoice List Preview */}
            {currentMonthInvoices.length > 0 && currentMonthInvoices.length <= 10 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="text-sm font-medium text-gray-700 mb-2">Invoices in this period:</h5>
                <div className="flex flex-wrap gap-2">
                  {currentMonthInvoices.slice(0, 10).map((inv, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      #{inv.invoiceNumber} - {new Date(inv.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  ))}
                  {currentMonthInvoices.length > 10 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      +{currentMonthInvoices.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* GSTR-1 Section */}
      <Card title="GSTR-1 (Outward Supplies)">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Export details of all outward supplies (sales) made during the selected period.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleExportGSTR1('xml')}
              disabled={isExporting || currentMonthInvoices.length === 0}
              className="w-full"
            >
              {isExporting ? 'Exporting...' : 'Export GSTR-1 (XML)'}
            </Button>
            <Button
              onClick={() => handleExportGSTR1('csv')}
              disabled={isExporting || currentMonthInvoices.length === 0}
              variant="secondary"
              className="w-full"
            >
              {isExporting ? 'Exporting...' : 'Export GSTR-1 (CSV)'}
            </Button>
          </div>
          
          {currentMonthInvoices.length === 0 && (
            <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
              No invoices found for the selected period.
            </p>
          )}
        </div>
      </Card>

      {/* GSTR-3B Section */}
      <Card title="GSTR-3B (Monthly Summary)">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Export monthly summary of GST payments and liabilities.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={() => handleExportGSTR3B('xml')}
              disabled={isExporting || currentMonthInvoices.length === 0}
              className="w-full"
            >
              {isExporting ? 'Exporting...' : 'Export GSTR-3B (XML)'}
            </Button>
            <Button
              onClick={() => handleExportGSTR3B('excel')}
              disabled={isExporting || currentMonthInvoices.length === 0}
              variant="secondary"
              className="w-full"
            >
              {isExporting ? 'Exporting...' : 'Export GSTR-3B (Excel)'}
            </Button>
          </div>
        </div>
      </Card>

      {/* SAC Code Management */}
      <Card title="SAC Code Management">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Default SAC Code"
              value="9965"
              disabled
              helperText="Transport services (Service Accounting Code)"
            />
            <div className="flex items-end">
              <Button variant="secondary" onClick={() => alert('SAC code management will be added to company settings')}>
                Manage SAC Codes
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">SAC Code Information</h4>
            <p className="text-sm text-blue-700">
              <strong>9965</strong> - Transport services (general)<br/>
              <strong>996511</strong> - Road transport services<br/>
              <strong>996512</strong> - Freight transport services
            </p>
          </div>
        </div>
      </Card>

      {/* GST Filing Status */}
      <Card title="GST Filing Status">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{currentMonthInvoices.length}</div>
              <div className="text-sm text-green-700">Invoices Ready</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">₹{totalTaxableAmount.toLocaleString('en-IN')}</div>
              <div className="text-sm text-blue-700">Taxable Value</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">₹{(totalCGST + totalSGST + totalIGST).toLocaleString('en-IN')}</div>
              <div className="text-sm text-purple-700">Total GST</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
