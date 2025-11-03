import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Invoice, Customer, CompanyInfo, Payment } from '../types';
import { InvoiceStatus } from '../types';
import type { View } from '../App';
import { formatDate } from '../services/utils';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { InvoiceView } from './InvoicePDF';
import { UniversalPaymentForm } from './UniversalPaymentForm';
import { UniversalPaymentHistoryModal } from './UniversalPaymentHistoryModal';
import { Pagination } from './ui/Pagination';
import { StatusBadge, getStatusVariant } from './ui/StatusBadge';
import { UniversalSearchSort, SortOption } from './ui/UniversalSearchSort';
import { getInvoiceWidthPx } from '../constants/invoiceDimensions';

interface InvoicesProps {
  invoices: Invoice[];
  payments: Payment[];
  customers: Customer[];
  companyInfo: CompanyInfo;
  onViewChange: (view: View) => void;
  onDeleteInvoice: (id: string) => void;
  onSavePayment: (payment: Omit<Payment, '_id' | 'customer' | 'invoice'>) => Promise<void>;
  onBack: () => void;
  initialFilters?: Partial<Record<keyof InvoicesTableFilters, any>>;
}

interface InvoicesTableFilters {
    searchTerm: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}

// Helper function to calculate payment information for an invoice
const calculatePaymentInfo = (invoice: Invoice, payments: Payment[]) => {
  const invoicePayments = payments.filter(p => {
    // Handle both string ID and populated object cases
    const paymentInvoiceId = typeof p.invoiceId === 'string' ? p.invoiceId : (p.invoiceId as any)?._id;
    return paymentInvoiceId === invoice._id;
  });
  const paidAmount = invoicePayments.reduce((sum, p) => sum + p.amount, 0);
  const balanceDue = invoice.grandTotal - paidAmount;
  
  return { paidAmount, balanceDue };
};

const PreviewModal: React.FC<{
  item: { type: 'INVOICE', data: Invoice };
  onClose: () => void;
  companyInfo: CompanyInfo;
  customers: Customer[];
}> = ({ item, onClose, companyInfo, customers }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [zoom, setZoom] = useState(100);
  const previewContainerRef = useRef<HTMLDivElement>(null);

  // Auto-calculate initial zoom based on container width
  useEffect(() => {
    const calculateInitialZoom = () => {
      if (!previewContainerRef.current) return;
      
      const container = previewContainerRef.current;
      const containerWidth = container.clientWidth;
      
      // Invoice width - now configurable (default: 550mm)
      // Get the actual invoice width in pixels
      const invoiceWidthPx = getInvoiceWidthPx();
      const padding = 32; // Horizontal padding in preview
      const availableWidth = containerWidth - padding;
      
      // Calculate zoom to fit width with some margin
      const calculatedZoom = Math.min(Math.max(50, Math.floor((availableWidth / invoiceWidthPx) * 100)), 150);
      setZoom(calculatedZoom);
    };

    // Calculate after a short delay to ensure container is rendered
    const timer = setTimeout(calculateInitialZoom, 100);
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateInitialZoom);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculateInitialZoom);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeModal = () => {
    setIsClosing(true);
    setTimeout(() => {
        onClose();
    }, 300); // Match animation duration
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleFitToWidth = () => {
    setZoom(100);
  };

  const modalAnimation = isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100';
  const backdropAnimation = isClosing ? 'opacity-0' : 'opacity-100';

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-2 sm:p-4 transition-opacity duration-300 ease-in-out ${backdropAnimation}`}
      onClick={closeModal}
      data-form-modal="true"
      aria-modal="true"
      role="dialog"
      data-pdf-viewer="true"
    >
      <div
        className={`bg-white rounded-xl shadow-2xl max-h-[95vh] w-full max-w-7xl overflow-hidden flex flex-col transform transition-all duration-300 ease-in-out ${modalAnimation}`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b bg-slate-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-800">{`Preview: Invoice #${item.data.invoiceNumber}`}</h2>
          <div className="flex items-center space-x-4">
            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleZoomOut}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Zoom Out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm font-medium text-gray-700 min-w-[3rem] text-center">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Zoom In"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                onClick={handleFitToWidth}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 rounded transition-colors"
                title="Fit to Width"
              >
                Fit
              </button>
            </div>
            <button onClick={closeModal} className="text-gray-400 hover:text-gray-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="overflow-auto bg-gray-200 flex-1" ref={previewContainerRef}>
          <div 
            className="p-2 sm:p-4 md:p-8 flex justify-center"
            style={{ 
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
              transition: 'transform 0.3s ease'
            }}
          >
            {item.type === 'INVOICE' && item.data.customer && (
              <InvoiceView
                invoice={item.data as Invoice}
                companyInfo={companyInfo}
                customers={customers}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


export const Invoices: React.FC<InvoicesProps> = ({ invoices, payments, customers, companyInfo, onViewChange, onDeleteInvoice, onSavePayment, onBack, initialFilters }) => {
  const [searchTerm, setSearchTerm] = useState(initialFilters?.searchTerm || '');
  const [sortBy, setSortBy] = useState(initialFilters?.sortBy || 'invoiceNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialFilters?.sortOrder || 'desc');
  const [previewItem, setPreviewItem] = useState<{type: 'INVOICE', data: Invoice} | null>(null);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedInvoiceForHistory, setSelectedInvoiceForHistory] = useState<Invoice | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Sort options for Invoices
  const sortOptions: SortOption[] = [
    { value: 'invoiceNumber', label: 'Sort by Invoice Number' },
    { value: 'date', label: 'Sort by Date' },
    { value: 'customer', label: 'Sort by Customer' },
    { value: 'grandTotal', label: 'Sort by Amount' },
    { value: 'status', label: 'Sort by Status' }
  ];

  const handleOpenPaymentForm = (invoice: Invoice) => {
    console.log('Opening payment form for invoice:', JSON.stringify(invoice, null, 2));
    console.log('CustomerId:', invoice.customerId);
    setSelectedInvoiceForPayment(invoice);
    setIsPaymentFormOpen(true);
  };

  const handleOpenHistoryModal = (invoice: Invoice) => {
    setSelectedInvoiceForHistory(invoice);
    setIsHistoryModalOpen(true);
  };

  const filteredInvoices = useMemo(() => {
    let filtered = invoices.filter(inv => {
      const customerName = inv.customer?.name || '';
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch = searchTerm === '' ||
        inv.invoiceNumber.toString().includes(searchTerm) ||
        customerName.toLowerCase().includes(searchLower) ||
        inv.lorryReceipts.some(lr => lr.lrNumber.toString().includes(searchTerm)) ||
        inv.status.toLowerCase().includes(searchLower);

      return matchesSearch;
    });

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue: any = '';
      let bValue: any = '';
      
      switch (sortBy) {
        case 'invoiceNumber':
          aValue = a.invoiceNumber;
          bValue = b.invoiceNumber;
          break;
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'customer':
          aValue = (a.customer?.name || '').toLowerCase();
          bValue = (b.customer?.name || '').toLowerCase();
          break;
        case 'grandTotal':
          aValue = a.grandTotal || 0;
          bValue = b.grandTotal || 0;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          aValue = a.invoiceNumber;
          bValue = b.invoiceNumber;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [invoices, searchTerm, sortBy, sortOrder]);

  // Paginated invoices
  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8">
      {isPaymentFormOpen && selectedInvoiceForPayment && (
        <UniversalPaymentForm
          invoiceId={selectedInvoiceForPayment._id}
          customerId={selectedInvoiceForPayment.customerId}
          grandTotal={selectedInvoiceForPayment.grandTotal}
          balanceDue={calculatePaymentInfo(selectedInvoiceForPayment, payments).balanceDue}
          onSave={onSavePayment}
          onClose={() => setIsPaymentFormOpen(false)}
          title={`Add Payment for Invoice #${selectedInvoiceForPayment.invoiceNumber}`}
        />
      )}
      {isHistoryModalOpen && selectedInvoiceForHistory && (
        <UniversalPaymentHistoryModal
          invoice={selectedInvoiceForHistory}
          payments={payments}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
      {previewItem && (
        <PreviewModal
          item={previewItem}
          onClose={() => setPreviewItem(null)}
          companyInfo={companyInfo}
          customers={customers}
        />
      )}
      <Card>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
            <div className="space-x-2">
              <Button onClick={() => onViewChange({ name: 'CREATE_INVOICE' })}>Create New Invoice</Button>
              <Button onClick={onBack} variant="secondary">Back to Dashboard</Button>
            </div>
        </div>
        
        <UniversalSearchSort
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by invoice number, customer name, LR numbers, or status..."
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          sortOptions={sortOptions}
          totalItems={invoices.length}
          filteredItems={filteredInvoices.length}
          onClearSearch={handleClearSearch}
        />
      </Card>

      <Card>
         <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No.</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInvoices.map(inv => {
                const { paidAmount, balanceDue } = calculatePaymentInfo(inv, payments);
                return (
                <tr key={inv._id} onClick={() => setPreviewItem({ type: 'INVOICE', data: inv })} className="hover:bg-slate-50 transition-colors duration-200 cursor-pointer">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(inv.date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{inv.customer?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">₹{(inv.grandTotal || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right">₹{paidAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-semibold text-right">₹{balanceDue.toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <StatusBadge status={inv.status} variant={getStatusVariant(inv.status)} size="sm" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    {inv.status !== InvoiceStatus.PAID && (
                      <button onClick={(e) => { e.stopPropagation(); handleOpenPaymentForm(inv); }} className="text-blue-600 hover:text-blue-900 transition-colors">Add Payment</button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleOpenHistoryModal(inv); }} className="text-gray-600 hover:text-gray-900 transition-colors">History</button>
                    <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'VIEW_INVOICE', id: inv._id }); }} className="text-indigo-600 hover:text-indigo-900 transition-colors">View PDF</button>
                    <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'EDIT_INVOICE', id: inv._id }); }} className="text-green-600 hover:text-green-900 transition-colors">Edit</button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteInvoice(inv._id); }} className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredInvoices.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </Card>
    </div>
  );
};
