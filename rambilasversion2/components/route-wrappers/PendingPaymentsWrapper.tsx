import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { PendingPayments } from '../PendingPayments';

export const PendingPaymentsWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  
  return (
    <PendingPayments 
      invoices={context.invoices} 
      onSavePayment={context.savePayment} 
      onBack={() => context.navigate('/dashboard')} 
      onViewChange={(view) => {
        switch (view.name) {
          case 'VIEW_INVOICE':
            context.navigate(`/invoices/view/${view.id}`);
            break;
          default:
            context.navigate('/payments');
        }
      }} 
    />
  );
};



