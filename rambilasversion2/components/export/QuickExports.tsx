import type { LorryReceipt, Invoice, Payment, Customer, TruckHiringNote } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { exportToCsv } from '../../services/exportService';
import { formatDate } from '../../services/utils';

interface QuickExportsProps {
  lorryReceipts: LorryReceipt[];
  invoices: Invoice[];
  payments: Payment[];
  customers: Customer[];
  truckHiringNotes: TruckHiringNote[];
}

export const QuickExports = (props: QuickExportsProps) => {
  const handleExportLrs = () => {
    const data = props.lorryReceipts.map(lr => ({
      'LR No': lr.lrNumber,
      'Date': formatDate(lr.date),
      'Consignor': lr.consignor?.name || '',
      'Consignee': lr.consignee?.name || '',
      'Vehicle No': lr.vehicle?.number || '',
      'From': lr.from,
      'To': lr.to,
      'Amount': lr.totalAmount,
      'Status': lr.status
    }));
    exportToCsv(data, 'lorry-receipts');
  };

  const handleExportInvoices = () => {
    const data = props.invoices.map(inv => ({
      'Invoice No': inv.invoiceNumber,
      'Date': formatDate(inv.date),
      'Customer': inv.customer?.name || '',
      'Amount': inv.totalAmount,
      'GST Type': inv.gstType,
      'CGST': inv.cgstAmount,
      'SGST': inv.sgstAmount,
      'IGST': inv.igstAmount,
      'Grand Total': inv.grandTotal,
      'Status': inv.status
    }));
    exportToCsv(data, 'invoices');
  };

  const handleExportTHNs = () => {
    const data = props.truckHiringNotes.map(thn => ({
      'THN No': thn.thnNumber,
      'Date': formatDate(thn.date),
      'Truck No': thn.truckNumber,
      'From': thn.loadingLocation,
      'To': thn.unloadingLocation,
      'Freight Rate': thn.freightRate,
      'Total Amount': thn.totalAmount,
      'Status': thn.status
    }));
    exportToCsv(data, 'truck-hiring-notes');
  };

  const handleExportCustomers = () => {
    const data = props.customers.map(customer => ({
      'Name': customer.name,
      'Trade Name': customer.tradeName || '',
      'Address': customer.address,
      'State': customer.state,
      'GSTIN': customer.gstin || '',
      'Contact Person': customer.contactPerson || '',
      'Phone': customer.contactPhone || customer.phone || '',
      'Email': customer.contactEmail || customer.email || ''
    }));
    exportToCsv(data, 'customers');
  };

  const handleExportPayments = () => {
    const data = props.payments.map(payment => ({
      'Date': formatDate(payment.date),
      'Amount': payment.amount,
      'Mode': payment.mode,
      'Reference': payment.reference || '',
      'Notes': payment.notes || '',
      'Status': payment.status
    }));
    exportToCsv(data, 'payments');
  };

  const handleExportAllData = () => {
    const allData = {
      customers: props.customers,
      lorryReceipts: props.lorryReceipts,
      invoices: props.invoices,
      truckHiringNotes: props.truckHiringNotes,
      payments: props.payments,
      exportInfo: {
        exportedAt: new Date().toISOString(),
        totalRecords: props.customers.length + props.lorryReceipts.length + props.invoices.length + props.truckHiringNotes.length + props.payments.length,
        dateRange: {
          start: getEarliestDate(),
          end: getLatestDate()
        }
      }
    };
    
    const dataStr = JSON.stringify(allData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    
    const dateRange = getDateRangeString();
    link.download = `complete-data-backup-${dateRange}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getEarliestDate = () => {
    const allDates = [
      ...props.lorryReceipts.map(lr => lr.date),
      ...props.invoices.map(inv => inv.date),
      ...props.truckHiringNotes.map(thn => thn.date),
      ...props.payments.map(pay => pay.date)
    ].filter(Boolean);
    
    if (allDates.length === 0) return new Date().toISOString().split('T')[0];
    return new Date(Math.min(...allDates.map(d => new Date(d).getTime()))).toISOString().split('T')[0];
  };

  const getLatestDate = () => {
    const allDates = [
      ...props.lorryReceipts.map(lr => lr.date),
      ...props.invoices.map(inv => inv.date),
      ...props.truckHiringNotes.map(thn => thn.date),
      ...props.payments.map(pay => pay.date)
    ].filter(Boolean);
    
    if (allDates.length === 0) return new Date().toISOString().split('T')[0];
    return new Date(Math.max(...allDates.map(d => new Date(d).getTime()))).toISOString().split('T')[0];
  };

  const getDateRangeString = () => {
    const start = getEarliestDate();
    const end = getLatestDate();
    return start === end ? start : `${start}-to-${end}`;
  };

  const exportButtons = [
    {
      label: 'Lorry Receipts',
      count: props.lorryReceipts.length,
      onClick: handleExportLrs,
      description: 'Export all lorry receipts to CSV',
      color: 'blue'
    },
    {
      label: 'Invoices',
      count: props.invoices.length,
      onClick: handleExportInvoices,
      description: 'Export all invoices with GST details to CSV',
      color: 'green'
    },
    {
      label: 'Truck Hiring Notes',
      count: props.truckHiringNotes.length,
      onClick: handleExportTHNs,
      description: 'Export all truck hiring notes to CSV',
      color: 'purple'
    },
    {
      label: 'Customers',
      count: props.customers.length,
      onClick: handleExportCustomers,
      description: 'Export all customer details to CSV',
      color: 'orange'
    },
    {
      label: 'Payments',
      count: props.payments.length,
      onClick: handleExportPayments,
      description: 'Export all payment records to CSV',
      color: 'red'
    },
    {
      label: 'Complete Data',
      count: props.lorryReceipts.length + props.invoices.length + props.truckHiringNotes.length + props.customers.length + props.payments.length,
      onClick: handleExportAllData,
      description: 'Export all data as JSON backup',
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800">Quick Exports</h3>
        <p className="text-gray-600 mt-1">One-click exports for your most common data needs</p>
        
        {/* Data Range Info */}
        <div className="mt-4 bg-blue-50 border border-blue-200 p-3 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-blue-800">Data Range:</span>
            <span className="text-sm text-blue-700">
              {getEarliestDate() === getLatestDate() 
                ? getEarliestDate() 
                : `${getEarliestDate()} to ${getLatestDate()}`
              }
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exportButtons.map((button, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">{button.label}</h4>
                <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${button.color}-100 text-${button.color}-800`}>
                  {button.count} records
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{button.description}</p>
              
              <Button
                onClick={button.onClick}
                variant="secondary"
                className="w-full"
                disabled={button.count === 0}
              >
                {button.count === 0 ? 'No data to export' : `Export ${button.label}`}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Need more control?</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>Use the <strong>Advanced Exports</strong> tab for custom date ranges, field selection, and multiple export formats.</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
