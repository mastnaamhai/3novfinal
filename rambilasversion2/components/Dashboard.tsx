import React, { useMemo } from 'react';
import type { LorryReceipt, Invoice, Payment, TruckHiringNote } from '../types';
import { LorryReceiptStatus, InvoiceStatus } from '../types';
import type { View } from '../App';
import { formatDate } from '../services/utils';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { StatusBadge, getStatusVariant } from './ui/StatusBadge';

interface DashboardProps {
  lorryReceipts: LorryReceipt[];
  invoices: Invoice[];
  payments: Payment[];
  truckHiringNotes: TruckHiringNote[];
  onViewChange: (view: View) => void;
  onUpdateLrStatus: (id: string, status: LorryReceiptStatus) => void;
  onDeleteLr: (id: string) => void;
  onDeleteInvoice: (id: string) => void;
  onSavePayment: (payment: Omit<Payment, '_id' | 'customer' | 'invoice'>) => Promise<void>;
}

const statusColors: { [key in LorryReceiptStatus]: string } = {
  [LorryReceiptStatus.CREATED]: 'bg-blue-100 text-blue-800',
  [LorryReceiptStatus.IN_TRANSIT]: 'bg-yellow-100 text-yellow-800',
  [LorryReceiptStatus.DELIVERED]: 'bg-green-100 text-green-800',
  [LorryReceiptStatus.INVOICED]: 'bg-purple-100 text-purple-800',
  [LorryReceiptStatus.PAID]: 'bg-pink-100 text-pink-800',
  [LorryReceiptStatus.UNBILLED]: 'bg-orange-100 text-orange-800',
};

const invoiceStatusColors: { [key in InvoiceStatus]: string } = {
    [InvoiceStatus.UNPAID]: 'bg-red-100 text-red-800',
    [InvoiceStatus.PARTIALLY_PAID]: 'bg-yellow-100 text-yellow-800',
    [InvoiceStatus.PAID]: 'bg-green-100 text-green-800',
};

const KpiCard: React.FC<{ title: string; value: string | number; icon: string, onClick?: () => void }> = ({ title, value, icon, onClick }) => (
    <Card className="flex flex-col hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer group" onClick={onClick}>
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs sm:text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">{title}</p>
      <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform duration-200">{icon}</span>
    </div>
    <p className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{value}</p>
  </Card>
);

export const Dashboard: React.FC<DashboardProps> = ({ lorryReceipts, invoices, truckHiringNotes, onViewChange, onUpdateLrStatus, onDeleteLr, onDeleteInvoice }) => {
  // Debug logging
  console.log('=== DASHBOARD DATA DEBUG ===');
  console.log('Lorry Receipts count:', lorryReceipts?.length || 0);
  console.log('Invoices count:', invoices?.length || 0);
  console.log('Truck Hiring Notes count:', truckHiringNotes?.length || 0);
  console.log('Latest LR numbers:', lorryReceipts?.slice(0, 3).map(lr => lr.lrNumber) || []);
  console.log('Latest Invoice numbers:', invoices?.slice(0, 3).map(inv => inv.invoiceNumber) || []);
  
  const kpis = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Ensure arrays are defined before using filter
    const safeLorryReceipts = Array.isArray(lorryReceipts) ? lorryReceipts : [];
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const safeTruckHiringNotes = Array.isArray(truckHiringNotes) ? truckHiringNotes : [];

    const totalLrsToday = safeLorryReceipts.filter(lr => {
      const lrDate = new Date(lr.date);
      lrDate.setHours(0, 0, 0, 0);
      return lrDate.getTime() === today.getTime();
    }).length;

    const invoicedLrIds = new Set(safeInvoices.flatMap(inv => inv.lorryReceipts?.map(lr => lr._id) || []));
    const unbilledLrs = safeLorryReceipts.filter(lr => !invoicedLrIds.has(lr._id));

    const outstandingPayments = safeInvoices.reduce((acc, inv) => {
        return acc + (inv.balanceDue || 0);
    }, 0);

    const totalFreightThisMonth = safeTruckHiringNotes.filter(thn => {
        const thnDate = new Date(thn.date);
        return thnDate.getMonth() === today.getMonth() && thnDate.getFullYear() === today.getFullYear();
    }).reduce((acc, thn) => acc + thn.freight, 0);

    const outstandingSupplierPayments = safeTruckHiringNotes.reduce((acc, thn) => acc + thn.balancePayable, 0);

    return {
      totalLrsToday,
      totalLrs: safeLorryReceipts.length,
      totalInvoices: safeInvoices.length,
      outstandingPayments,
      totalFreightThisMonth,
      outstandingSupplierPayments,
      unbilledCount: unbilledLrs.length,
    };
  }, [lorryReceipts, invoices, truckHiringNotes]);

  const recentLrs = useMemo(() => {
    const safeLorryReceipts = Array.isArray(lorryReceipts) ? lorryReceipts : [];
    return safeLorryReceipts.sort((a, b) => b.lrNumber - a.lrNumber).slice(0, 5);
  }, [lorryReceipts]);

  const recentInvoices = useMemo(() => {
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    return safeInvoices.sort((a, b) => b.invoiceNumber - a.invoiceNumber).slice(0, 5);
  }, [invoices]);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];

  const unbilledLrIds = useMemo(() => {
    const invoicedLrIds = new Set(invoices.flatMap(inv => inv.lorryReceipts.map(lr => lr._id)));
    return lorryReceipts.filter(lr => !invoicedLrIds.has(lr._id)).map(lr => lr._id);
    }, [lorryReceipts, invoices]);

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
        <h1 className="text-2xl lg:text-3xl font-bold mb-2">Welcome to TranspoTruck Dashboard</h1>
        <p className="text-indigo-100 text-sm lg:text-base">Manage your transport operations efficiently</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <KpiCard title="Total Lorry Receipts" value={kpis.totalLrs} icon="📄" onClick={() => onViewChange({ name: 'LORRY_RECEIPTS' })} />
        <KpiCard title="Total Invoices" value={kpis.totalInvoices} icon="🧾" onClick={() => onViewChange({ name: 'INVOICES' })} />
        <KpiCard title="Total LRs Today" value={kpis.totalLrsToday} icon="🚚" onClick={() => onViewChange({ name: 'LORRY_RECEIPTS', filters: { startDate: todayStr, endDate: todayStr } })} />
        <KpiCard title="Unbilled LRs" value={kpis.unbilledCount} icon="📦" onClick={() => onViewChange({ name: 'LORRY_RECEIPTS', filters: { ids: unbilledLrIds } })} />
        <KpiCard title="Outstanding Payments" value={`₹${(kpis.outstandingPayments || 0).toLocaleString('en-IN')}`} icon="💰" onClick={() => onViewChange({ name: 'INVOICES', filters: { status: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] } })} />
        <KpiCard title="Total Freight This Month" value={`₹${(kpis.totalFreightThisMonth || 0).toLocaleString('en-IN')}`} icon="📊" onClick={() => onViewChange({ name: 'TRUCK_HIRING_NOTES', filters: { startDate: firstDayOfMonth, endDate: todayStr } })} />
        <KpiCard title="Outstanding Supplier Payments" value={`₹${(kpis.outstandingSupplierPayments || 0).toLocaleString('en-IN')}`} icon="💳" onClick={() => onViewChange({ name: 'TRUCK_HIRING_NOTES', filters: { showOnlyOutstanding: true } })} />
      </div>

      

      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Lorry Receipts</h3>
          <Button onClick={() => onViewChange({ name: 'LORRY_RECEIPTS' })} variant="secondary" className="w-full sm:w-auto">
            View All
          </Button>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3">
          {recentLrs.map(lr => (
            <div key={lr._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">📄</span>
                  <span className="font-semibold text-gray-900">LR #{lr.lrNumber}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColors[lr.status]}`}>
                  {lr.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Date:</span> {formatDate(lr.date)}</p>
                <p><span className="font-medium">From:</span> {lr.consignor?.name}</p>
                <p><span className="font-medium">To:</span> {lr.consignee?.name}</p>
                <p><span className="font-medium">Amount:</span> ₹{(lr.totalAmount || 0).toLocaleString('en-IN')}</p>
              </div>
              <div className="flex space-x-2 mt-3">
                <button 
                  onClick={() => onViewChange({ name: 'VIEW_LR', id: lr._id })} 
                  className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                >
                  View
                </button>
                <button 
                  onClick={() => onDeleteLr(lr._id)} 
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LR No.</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consignor</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consignee</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentLrs.map(lr => (
                <tr key={lr._id} className="hover:bg-slate-50 transition-colors duration-200">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{lr.lrNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(lr.date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lr.consignor?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{lr.consignee?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">₹{(lr.totalAmount || 0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                     <StatusBadge status={lr.status} variant={getStatusVariant(lr.status)} size="sm" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'VIEW_LR', id: lr._id }); }} className="text-indigo-600 hover:text-indigo-900 transition-colors">View</button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteLr(lr._id); }} className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-800">Recent Invoices</h3>
          <Button onClick={() => onViewChange({ name: 'INVOICES' })} variant="secondary" className="w-full sm:w-auto">
            View All
          </Button>
        </div>
        
        {/* Mobile Card View */}
        <div className="block lg:hidden space-y-3">
          {recentInvoices.map(inv => (
            <div key={inv._id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">🧾</span>
                  <span className="font-semibold text-gray-900">Invoice #{inv.invoiceNumber}</span>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${invoiceStatusColors[inv.status]}`}>
                  {inv.status}
                </span>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Date:</span> {formatDate(inv.date)}</p>
                <p><span className="font-medium">Client:</span> {inv.customer?.name}</p>
                <p><span className="font-medium">Balance Due:</span> <span className="text-red-600 font-semibold">₹{(inv.balanceDue || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></p>
              </div>
              <div className="flex space-x-2 mt-3">
                <button 
                  onClick={() => onViewChange({ name: 'VIEW_INVOICE', id: inv._id })} 
                  className="flex-1 bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-200 transition-colors"
                >
                  View
                </button>
                <button 
                  onClick={() => onDeleteInvoice(inv._id)} 
                  className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice No.</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance Due</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentInvoices.map(inv => (
                <tr key={inv._id} className="hover:bg-slate-50 transition-colors duration-200">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{formatDate(inv.date)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{inv.customer?.name}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 font-semibold text-right">₹{(inv.balanceDue || 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <StatusBadge status={inv.status} variant={getStatusVariant(inv.status)} size="sm" />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={(e) => { e.stopPropagation(); onViewChange({ name: 'VIEW_INVOICE', id: inv._id }); }} className="text-indigo-600 hover:text-indigo-900 transition-colors">View</button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteInvoice(inv._id); }} className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};