import React, { useState, useMemo } from 'react';
import type { Customer, Invoice, Payment, TruckHiringNote, CompanyInfo } from '../types';
import { LedgerService } from '../services/ledgerService';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { StatusBadge } from './ui/StatusBadge';
import { formatDate } from '../services/utils';
import { LedgerExportService } from '../services/ledgerExportService';
import type { View } from '../App';
import type { ClientLedgerData, CompanyLedgerData, LedgerFilters } from '../types/ledger';

interface EnhancedLedgerProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  truckHiringNotes: TruckHiringNote[];
  companyInfo: CompanyInfo;
  onViewChange: (view: View) => void;
  onBack: () => void;
}

type LedgerView = 'client' | 'company' | 'summary';

export const EnhancedLedger: React.FC<EnhancedLedgerProps> = (props) => {
  const [view, setView] = useState<LedgerView>('client');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [filters, setFilters] = useState<LedgerFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });

  // Debug logging
  console.log('EnhancedLedger props:', {
    customersCount: props.customers?.length || 0,
    invoicesCount: props.invoices?.length || 0,
    paymentsCount: props.payments?.length || 0,
    truckHiringNotesCount: props.truckHiringNotes?.length || 0
  });

  // Generate ledger data
  const clientLedgerData = useMemo(() => {
    if (!selectedCustomerId) return null;
    const customer = props.customers.find(c => c._id === selectedCustomerId);
    if (!customer) return null;
    
    try {
      return LedgerService.generateClientLedger(
        selectedCustomerId,
        customer,
        props.invoices || [],
        props.payments || [],
        props.truckHiringNotes || [],
        filters
      );
    } catch (error) {
      console.error('Error generating client ledger:', error);
      return null;
    }
  }, [selectedCustomerId, props.customers, props.invoices, props.payments, props.truckHiringNotes, filters]);

  const companyLedgerData = useMemo(() => {
    try {
      return LedgerService.generateCompanyLedger(
        props.customers || [],
        props.invoices || [],
        props.payments || [],
        props.truckHiringNotes || [],
        filters
      );
    } catch (error) {
      console.error('Error generating company ledger:', error);
      return null;
    }
  }, [props.customers, props.invoices, props.payments, props.truckHiringNotes, filters]);

  const handleExportLedger = async (format: 'PDF' | 'EXCEL') => {
    try {
      if (view === 'client' && clientLedgerData) {
        if (format === 'PDF') {
          await LedgerExportService.exportClientLedgerPDF(
            clientLedgerData,
            props.companyInfo,
            { format: 'PDF', includeSummary: true, includeNotes: true }
          );
        } else {
          await LedgerExportService.exportLedgerExcel(
            clientLedgerData,
            `Client_Ledger_${clientLedgerData.customerName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}`
          );
        }
      } else if (view === 'company' && companyLedgerData) {
        if (format === 'PDF') {
          await LedgerExportService.exportCompanyLedgerPDF(
            companyLedgerData,
            props.companyInfo,
            { format: 'PDF', includeSummary: true, includeNotes: true }
          );
        } else {
          await LedgerExportService.exportLedgerExcel(
            companyLedgerData,
            `Company_Ledger_${new Date().toISOString().split('T')[0]}`
          );
        }
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const getBalanceColor = (balanceType: 'DR' | 'CR', amount: number) => {
    if (balanceType === 'DR') return 'text-red-600';
    if (balanceType === 'CR') return 'text-green-600';
    return 'text-gray-600';
  };

  const getBalanceBadge = (balanceType: 'DR' | 'CR') => {
    return balanceType === 'DR' ? 'Debit' : 'Credit';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Enhanced Ledger System</h2>
        <Button variant="secondary" onClick={props.onBack}>Back</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <Input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <Input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <Select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
            >
              <option value="">All Customers</option>
              {props.customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex items-end">
            <Button 
              variant="primary" 
              onClick={() => setFilters({ ...filters })}
              className="w-full"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <Card>
        <div className="flex border-b">
          <button
            className={`px-4 py-2 text-lg font-medium ${view === 'client' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setView('client')}
          >
            Client Ledger
          </button>
          <button
            className={`px-4 py-2 text-lg font-medium ${view === 'company' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setView('company')}
          >
            Company Ledger
          </button>
          <button
            className={`px-4 py-2 text-lg font-medium ${view === 'summary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setView('summary')}
          >
            Summary Report
          </button>
        </div>
      </Card>

      {/* Client Ledger View */}
      {view === 'client' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Client Ledger</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => handleExportLedger('PDF')}>
                Export PDF
              </Button>
              <Button variant="secondary" onClick={() => handleExportLedger('EXCEL')}>
                Export Excel
              </Button>
            </div>
          </div>

          {!selectedCustomerId ? (
            <div className="text-center py-8 text-gray-500">
              Please select a customer to view their ledger
            </div>
          ) : clientLedgerData ? (
            <div className="space-y-4">
              {/* Customer Summary */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800">{clientLedgerData.customerName}</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <span className="text-sm text-gray-600">Total Debits:</span>
                    <p className="font-semibold text-red-600">
                      {LedgerService.formatCurrency(clientLedgerData.summary.totalDebits)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Credits:</span>
                    <p className="font-semibold text-green-600">
                      {LedgerService.formatCurrency(clientLedgerData.summary.totalCredits)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Closing Balance:</span>
                    <p className={`font-semibold ${getBalanceColor(clientLedgerData.summary.closingBalanceType, clientLedgerData.summary.closingBalance)}`}>
                      {LedgerService.formatCurrency(clientLedgerData.summary.closingBalance)} {clientLedgerData.summary.closingBalanceType}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Transactions:</span>
                    <p className="font-semibold">{clientLedgerData.summary.transactionCount}</p>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clientLedgerData.transactions.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {LedgerService.formatDate(entry.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>
                            <p>{entry.particulars}</p>
                            {entry.notes && (
                              <p className="text-xs text-gray-500">{entry.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">
                          {entry.debit > 0 ? LedgerService.formatCurrency(entry.debit) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">
                          {entry.credit > 0 ? LedgerService.formatCurrency(entry.credit) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={getBalanceColor(entry.balanceType, entry.balance)}>
                            {LedgerService.formatCurrency(entry.balance)} {entry.balanceType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.paymentMode || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No ledger data available for selected customer
            </div>
          )}
        </Card>
      )}

      {/* Company Ledger View */}
      {view === 'company' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Company Ledger</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => handleExportLedger('PDF')}>
                Export PDF
              </Button>
              <Button variant="secondary" onClick={() => handleExportLedger('EXCEL')}>
                Export Excel
              </Button>
            </div>
          </div>

          {companyLedgerData ? (
            <div className="space-y-4">
              {/* Company Summary */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800">Company Financial Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <span className="text-sm text-gray-600">Total Revenue:</span>
                    <p className="font-semibold text-green-600">
                      {LedgerService.formatCurrency(companyLedgerData.summary.totalRevenue)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Total Expenses:</span>
                    <p className="font-semibold text-red-600">
                      {LedgerService.formatCurrency(companyLedgerData.summary.totalExpenses)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Net Profit:</span>
                    <p className={`font-semibold ${companyLedgerData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {LedgerService.formatCurrency(companyLedgerData.summary.netProfit)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Period:</span>
                    <p className="font-semibold">
                      {LedgerService.formatDate(companyLedgerData.period.startDate)} - {LedgerService.formatDate(companyLedgerData.period.endDate)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Particulars</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Debit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Credit</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {companyLedgerData.transactions.map((entry, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {LedgerService.formatDate(entry.date)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div>
                            <p>{entry.particulars}</p>
                            {entry.notes && (
                              <p className="text-xs text-gray-500">{entry.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-red-600">
                          {entry.debit > 0 ? LedgerService.formatCurrency(entry.debit) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right text-green-600">
                          {entry.credit > 0 ? LedgerService.formatCurrency(entry.credit) : '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-right">
                          <span className={getBalanceColor(entry.balanceType, entry.balance)}>
                            {LedgerService.formatCurrency(entry.balance)} {entry.balanceType}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No company ledger data available
            </div>
          )}
        </Card>
      )}

      {/* Summary Report View */}
      {view === 'summary' && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">Summary Report</h3>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => handleExportLedger('PDF')}>
                Export PDF
              </Button>
              <Button variant="secondary" onClick={() => handleExportLedger('EXCEL')}>
                Export Excel
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Client Summary */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-3">Client Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Clients:</span>
                  <span className="font-semibold">{props.customers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Active Clients:</span>
                  <span className="font-semibold">
                    {props.customers.filter(c => 
                      props.invoices.some(inv => inv.customer?._id === c._id)
                    ).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">Transaction Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Invoices:</span>
                  <span className="font-semibold">{props.invoices.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Payments:</span>
                  <span className="font-semibold">{props.payments.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total THNs:</span>
                  <span className="font-semibold">{props.truckHiringNotes.length}</span>
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-3">Financial Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Revenue:</span>
                  <span className="font-semibold text-green-600">
                    {LedgerService.formatCurrency(props.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Expenses:</span>
                  <span className="font-semibold text-red-600">
                    {LedgerService.formatCurrency(props.truckHiringNotes.reduce((sum, thn) => sum + thn.freightRate, 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Net Profit:</span>
                  <span className="font-semibold">
                    {LedgerService.formatCurrency(
                      props.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0) -
                      props.truckHiringNotes.reduce((sum, thn) => sum + thn.freightRate, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
