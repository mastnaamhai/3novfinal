import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { EnhancedLedger } from '../EnhancedLedger';
import { SimpleLedger } from '../SimpleLedger';
import { ErrorBoundary } from '../ErrorBoundary';

export const EnhancedLedgerWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  
  return (
    <ErrorBoundary fallback={
      <SimpleLedger 
        customers={context.customers} 
        invoices={context.invoices} 
        payments={context.payments} 
        truckHiringNotes={context.truckHiringNotes} 
        companyInfo={context.companyInfo} 
        onViewChange={(view) => {
          switch (view.name) {
            case 'VIEW_CLIENT_LEDGER_PDF':
              context.navigate(`/ledger/client/${view.customerId}`);
              break;
            case 'VIEW_COMPANY_LEDGER_PDF':
              context.navigate('/ledger/company');
              break;
            default:
              context.navigate('/enhanced-ledger');
          }
        }} 
        onBack={() => context.navigate('/dashboard')} 
      />
    }>
      <EnhancedLedger 
        customers={context.customers} 
        invoices={context.invoices} 
        payments={context.payments} 
        truckHiringNotes={context.truckHiringNotes} 
        companyInfo={context.companyInfo} 
        onViewChange={(view) => {
          switch (view.name) {
            case 'VIEW_CLIENT_LEDGER_PDF':
              context.navigate(`/ledger/client/${view.customerId}`);
              break;
            case 'VIEW_COMPANY_LEDGER_PDF':
              context.navigate('/ledger/company');
              break;
            default:
              context.navigate('/enhanced-ledger');
          }
        }} 
        onBack={() => context.navigate('/dashboard')} 
      />
    </ErrorBoundary>
  );
};



