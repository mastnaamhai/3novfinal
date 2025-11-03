import React, { useMemo, useState, useEffect } from 'react';
import type { Invoice, Payment } from '../types';
import { InvoiceStatus } from '../types';
import { formatDate } from '../services/utils';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { UniversalPaymentForm } from './UniversalPaymentForm';
import { UniversalSearchSort, SortOption } from './ui/UniversalSearchSort';
import { Pagination } from './ui/Pagination';
import type { View } from '../App';

interface PendingPaymentsProps {
  invoices: Invoice[];
  onSavePayment: (payment: Omit<Payment, '_id' | 'customer' | 'invoice'>) => Promise<void>;
  onBack: () => void;
  onViewChange: (view: View) => void;
}

export const PendingPayments: React.FC<PendingPaymentsProps> = ({ invoices, onSavePayment, onBack, onViewChange }) => {
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  
  // Search and sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Sort options for Pending Payments
  const sortOptions: SortOption[] = [
    { value: 'invoiceNumber', label: 'Sort by Invoice Number' },
    { value: 'date', label: 'Sort by Date' },
    { value: 'customer', label: 'Sort by Customer' },
    { value: 'balanceDue', label: 'Sort by Balance Due' },
    { value: 'grandTotal', label: 'Sort by Total Amount' },
    { value: 'status', label: 'Sort by Status' }
  ];

  const pendingInvoices = useMemo(() => {
    let filtered = invoices.filter(inv => inv.status === InvoiceStatus.UNPAID || inv.status === InvoiceStatus.PARTIALLY_PAID);
    
    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(inv => {
        const customerName = inv.customer?.name || '';
        return (
          inv.invoiceNumber.toString().includes(searchTerm) ||
          customerName.toLowerCase().includes(searchLower) ||
          inv.status.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply sorting
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
        case 'balanceDue':
          aValue = a.balanceDue || a.grandTotal;
          bValue = b.balanceDue || b.grandTotal;
          break;
        case 'grandTotal':
          aValue = a.grandTotal;
          bValue = b.grandTotal;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
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
    return pendingInvoices.slice(startIndex, startIndex + itemsPerPage);
  }, [pendingInvoices, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(pendingInvoices.length / itemsPerPage);

  // Reset to first page when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const handleClearSearch = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleOpenPaymentForm = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPaymentFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {isPaymentFormOpen && selectedInvoice && (
        <UniversalPaymentForm
          invoiceId={selectedInvoice._id}
          customerId={selectedInvoice.customerId}
          grandTotal={selectedInvoice.grandTotal}
          balanceDue={selectedInvoice.balanceDue || selectedInvoice.grandTotal}
          onSave={onSavePayment}
          onClose={() => setIsPaymentFormOpen(false)}
          title={`Add Payment for Invoice #${selectedInvoice.invoiceNumber}`}
        />
      )}
      
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Pending Payments</h2>
          <Button variant="secondary" onClick={onBack}>Back</Button>
        </div>
        
        <UniversalSearchSort
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          searchPlaceholder="Search by invoice number, customer name, or status..."
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOrder={sortOrder}
          onSortOrderChange={setSortOrder}
          sortOptions={sortOptions}
          totalItems={invoices.filter(inv => inv.status === InvoiceStatus.UNPAID || inv.status === InvoiceStatus.PARTIALLY_PAID).length}
          filteredItems={pendingInvoices.length}
          onClearSearch={handleClearSearch}
        />
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance Due</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInvoices.map(invoice => (
                <tr 
                  key={invoice._id} 
                  className="hover:bg-slate-50 cursor-pointer transition-colors duration-200"
                  onClick={() => onViewChange({ name: 'VIEW_INVOICE', id: invoice._id })}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{`INV-${invoice.invoiceNumber}`}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{invoice.customer.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(invoice.date)}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-red-600">₹{(invoice.balanceDue || invoice.grandTotal).toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      invoice.status === InvoiceStatus.UNPAID ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status}
                    </span>
                  </td>
                   <td className="px-6 py-4 text-right text-sm">
                      <Button 
                        variant="secondary" 
                        onClick={(e) => { e.stopPropagation(); handleOpenPaymentForm(invoice); }}
                      >
                        Add Payment
                      </Button>
                   </td>
                </tr>
              ))}
              {paginatedInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? (
                      <div>
                        <p>No pending payments found matching "{searchTerm}"</p>
                        <Button 
                          variant="link" 
                          onClick={handleClearSearch}
                          className="mt-2 text-sm"
                        >
                          Clear search to see all pending payments
                        </Button>
                      </div>
                    ) : (
                      "No pending payments."
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={pendingInvoices.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </Card>
    </div>
  );
};
