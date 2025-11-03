import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Ledger } from '../Ledger';

export const LedgerWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  
  return (
    <Ledger 
      customers={context.customers} 
      invoices={context.invoices} 
      payments={context.payments} 
      truckHiringNotes={context.truckHiringNotes} 
      onViewChange={(view) => {
        switch (view.name) {
          case 'VIEW_CLIENT_LEDGER_PDF':
            context.navigate(`/ledger/client/${view.customerId}`);
            break;
          case 'VIEW_COMPANY_LEDGER_PDF':
            context.navigate('/ledger/company');
            break;
          default:
            context.navigate('/ledger');
        }
      }} 
      onBack={() => context.navigate('/dashboard')} 
    />
  );
};



