import React, { useState } from 'react';
import type { Customer, Invoice, Payment, TruckHiringNote, CompanyInfo } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Select } from './ui/Select';
import type { View } from '../App';

interface SimpleLedgerProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  truckHiringNotes: TruckHiringNote[];
  companyInfo: CompanyInfo;
  onViewChange: (view: View) => void;
  onBack: () => void;
}

export const SimpleLedger: React.FC<SimpleLedgerProps> = (props) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const selectedCustomer = props.customers.find(c => c._id === selectedCustomerId);
  const customerInvoices = selectedCustomer ? props.invoices.filter(inv => inv.customer?._id === selectedCustomerId) : [];
  const customerPayments = selectedCustomer ? props.payments.filter(p => p.customerId === selectedCustomerId) : [];

  const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalInvoiced - totalPaid;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Simple Ledger System</h2>
        <Button variant="secondary" onClick={props.onBack}>Back</Button>
      </div>

      {/* Customer Selection */}
      <Card>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Customer</label>
          <Select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            <option value="">Select a customer...</option>
            {props.customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      {/* Customer Summary */}
      {selectedCustomer && (
        <Card>
          <h3 className="text-xl font-semibold mb-4">{selectedCustomer.name} - Account Summary</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">Total Invoiced</h4>
              <p className="text-2xl font-bold text-blue-600">₹{totalInvoiced.toFixed(2)}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Total Paid</h4>
              <p className="text-2xl font-bold text-green-600">₹{totalPaid.toFixed(2)}</p>
            </div>
            <div className={`p-4 rounded-lg ${balance >= 0 ? 'bg-red-50' : 'bg-green-50'}`}>
              <h4 className={`font-semibold ${balance >= 0 ? 'text-red-800' : 'text-green-800'}`}>
                Balance
              </h4>
              <p className={`text-2xl font-bold ${balance >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                ₹{Math.abs(balance).toFixed(2)} {balance >= 0 ? 'Dr' : 'Cr'}
              </p>
            </div>
          </div>

          {/* Invoices */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3">Invoices ({customerInvoices.length})</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice No</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        INV-{invoice.invoiceNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(invoice.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        ₹{invoice.grandTotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'Paid' ? 'bg-green-100 text-green-800' :
                          invoice.status === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div>
            <h4 className="font-semibold mb-3">Payments ({customerPayments.length})</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mode</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {customerPayments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(payment.date).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          payment.type === 'Advance' ? 'bg-blue-100 text-blue-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {payment.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-900">
                        ₹{payment.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {payment.mode}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {payment.referenceNo || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Company Summary */}
      <Card>
        <h3 className="text-xl font-semibold mb-4">Company Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800">Total Customers</h4>
            <p className="text-2xl font-bold text-blue-600">{props.customers.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800">Total Invoices</h4>
            <p className="text-2xl font-bold text-green-600">{props.invoices.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="font-semibold text-yellow-800">Total Payments</h4>
            <p className="text-2xl font-bold text-yellow-600">{props.payments.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800">Total THNs</h4>
            <p className="text-2xl font-bold text-purple-600">{props.truckHiringNotes.length}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
