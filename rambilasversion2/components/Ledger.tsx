import React, { useState } from 'react';
import type { Customer, Invoice, Payment, TruckHiringNote } from '../types';
// Removed ClientLedger and CompanyLedger imports - functionality integrated into this component
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import type { View } from '../App';

interface LedgerProps {
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
  truckHiringNotes: TruckHiringNote[];
  onViewChange: (view: View) => void;
  onBack: () => void;
}

type LedgerView = 'client' | 'company';

export const Ledger: React.FC<LedgerProps> = (props) => {
  const [view, setView] = useState<LedgerView>('client');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">Ledger</h2>
        <Button variant="secondary" onClick={props.onBack}>Back</Button>
      </div>
      
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
        </div>
      </Card>

      {view === 'client' ? (
        <Card>
          <h3 className="text-xl font-semibold mb-4">Client Ledger</h3>
          <div className="space-y-4">
            {props.customers.map(customer => {
              const customerInvoices = props.invoices.filter(inv => inv.customer?._id === customer._id);
              const customerPayments = props.payments.filter(p => {
                if (typeof p.invoiceId === 'string') return false;
                return (p.invoiceId as unknown as Invoice)?.customer?._id === customer._id;
              });
              
              const totalInvoiced = customerInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
              const totalPaid = customerPayments.reduce((sum, p) => sum + p.amount, 0);
              const balance = totalInvoiced - totalPaid;

              return (
                <div key={customer._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold">{customer.name}</h4>
                      <p className="text-sm text-gray-600">{customerInvoices.length} invoices</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">Balance: ₹{balance.toFixed(2)}</p>
                      <Button 
                        variant="secondary" 
                        size="sm"
                        onClick={() => props.onViewChange({ name: 'VIEW_CLIENT_LEDGER_PDF', customerId: customer._id })}
                      >
                        View PDF
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : (
        <Card>
          <h3 className="text-xl font-semibold mb-4">Company Ledger</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-green-600">Total Revenue</h4>
                <p className="text-2xl font-bold">
                  ₹{props.invoices.reduce((sum, inv) => sum + inv.grandTotal, 0).toFixed(2)}
                </p>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold text-red-600">Total Expenses</h4>
                <p className="text-2xl font-bold">
                  ₹{props.truckHiringNotes.reduce((sum, thn) => sum + thn.freightRate, 0).toFixed(2)}
                </p>
              </div>
            </div>
            <Button 
              variant="secondary"
              onClick={() => props.onViewChange({ name: 'VIEW_COMPANY_LEDGER_PDF' })}
            >
              View Company Ledger PDF
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};
