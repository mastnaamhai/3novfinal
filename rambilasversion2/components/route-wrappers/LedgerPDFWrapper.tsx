import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { LedgerPDF } from '../LedgerPDF';
import type { Invoice, Payment } from '../../types';

export const LedgerPDFWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  const { customerId } = useParams();
  
  if (customerId) {
    // Client ledger
    const customer = context.customers.find((c: any) => c._id === customerId);
    const customerInvoices = context.invoices.filter((inv: any) => inv.customer?._id === customerId);
    const customerPayments = context.payments.filter((p: any) => {
      if (typeof p.invoiceId === 'string') return false;
      return (p.invoiceId as unknown as Invoice)?.customer?._id === customerId;
    });

    const invoiceTx = customerInvoices.map((inv: any) => ({
      type: 'invoice', 
      date: inv.date, 
      particulars: `Invoice No: INV-${inv.invoiceNumber} - Freight charges for ${inv.lorryReceipts?.length || 0} LR${(inv.lorryReceipts?.length || 0) > 1 ? 's' : ''} - ${inv.customer?.name || 'Unknown Customer'}`, 
      debit: inv.grandTotal, 
      credit: 0
    }));
    
    const paymentTx = customerPayments.map((p: any) => {
      const paymentType = p.type === 'Advance' ? 'ADVANCE' : 'PAYMENT';
      const customerName = p.customer?.name || 'Unknown Customer';
      const paymentMode = p.mode;
      const reference = p.referenceNo || p._id.slice(-6);
      
      let particulars;
      if (p.type === 'Advance') {
        particulars = `Advance received from ${customerName} (Ref: ${reference}) - Mode: ${paymentMode}`;
      } else if (p.invoiceId) {
        const invoiceNumber = typeof p.invoiceId === 'string' ? p.invoiceId : (p.invoiceId as unknown as Invoice)?.invoiceNumber;
        particulars = `Payment for Invoice INV-${invoiceNumber} - ${customerName} (Mode: ${paymentMode})`;
      } else {
        particulars = `Payment received from ${customerName} (Mode: ${paymentMode})`;
      }
      
      return {
        type: paymentType.toLowerCase(), 
        date: p.date, 
        particulars,
        debit: 0, 
        credit: p.amount
      };
    });

    let runningBalance = 0;
    const transactions = [...invoiceTx, ...paymentTx]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(tx => {
        runningBalance += (tx.debit - tx.credit);
        return { ...tx, balance: `${Math.abs(runningBalance).toFixed(2)} ${runningBalance >= 0 ? 'Dr' : 'Cr'}` };
      });

    if (!customer) {
      return <div>Customer not found</div>;
    }

    return (
      <LedgerPDF
        title={`Client-Ledger-${customer.name}`}
        transactions={transactions}
        companyInfo={context.companyInfo}
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'particulars', label: 'Particulars' },
          { key: 'debit', label: 'Debit (₹)', align: 'right' },
          { key: 'credit', label: 'Credit (₹)', align: 'right' },
          { key: 'balance', label: 'Balance (₹)', align: 'right' },
        ]}
        summary={[
          { label: 'Client', value: customer.name },
          { label: 'Closing Balance', value: transactions.length > 0 ? transactions[transactions.length - 1].balance : '0.00 Dr', color: 'font-bold' }
        ]}
        onBack={() => context.navigate('/enhanced-ledger')}
      />
    );
  } else {
    // Company ledger
    const invoiceTxComp = context.invoices.map((inv: any) => ({ 
      type: 'income', 
      date: inv.date, 
      particulars: `Invoice No: INV-${inv.invoiceNumber} - Freight charges for ${inv.lorryReceipts?.length || 0} LR${(inv.lorryReceipts?.length || 0) > 1 ? 's' : ''} to ${inv.customer?.name || 'Unknown Customer'}`, 
      amount: inv.grandTotal 
    }));
    
    const thnTxComp = context.truckHiringNotes.map((thn: any) => ({ 
      type: 'expense', 
      date: thn.date, 
      particulars: `THN No: THN-${thn.thnNumber} - Freight payment to ${thn.truckOwnerName} (Route: ${thn.loadingLocation} to ${thn.unloadingLocation})`, 
      amount: thn.freightRate 
    }));
    
    const paymentTxComp = context.payments.map((p: any) => ({
      type: p.type === 'Advance' ? 'advance_received' : 'payment_received',
      date: p.date,
      particulars: `${p.type === 'Advance' ? 'Advance received' : 'Payment received'} from ${p.customer?.name || 'Unknown Customer'} (Mode: ${p.mode})`,
      amount: p.amount
    }));
    
    const companyTransactions = [...invoiceTxComp, ...thnTxComp, ...paymentTxComp].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
      <LedgerPDF
        title="Company-Ledger"
        transactions={companyTransactions}
        companyInfo={context.companyInfo}
        columns={[
          { key: 'date', label: 'Date' },
          { key: 'type', label: 'Type' },
          { key: 'particulars', label: 'Particulars' },
          { key: 'amount', label: 'Amount (₹)', align: 'right' },
        ]}
        onBack={() => context.navigate('/enhanced-ledger')}
      />
    );
  }
};



