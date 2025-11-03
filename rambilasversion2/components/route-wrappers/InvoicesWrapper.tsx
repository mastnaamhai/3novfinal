import React from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { Invoices } from '../Invoices';

export const InvoicesWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  const [searchParams] = useSearchParams();
  
  const filters = {
    status: searchParams.get('status') || undefined,
    customer: searchParams.get('customer') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  };
  
  return (
    <Invoices
      invoices={context.invoices}
      payments={context.payments}
      customers={context.customers}
      companyInfo={context.companyInfo}
      onViewChange={(view) => {
        switch (view.name) {
          case 'CREATE_INVOICE':
            context.navigate('/invoices/create');
            break;
          case 'EDIT_INVOICE':
            context.navigate(`/invoices/edit/${view.id}`);
            break;
          case 'VIEW_INVOICE':
            context.navigate(`/invoices/view/${view.id}`);
            break;
          default:
            context.navigate('/invoices');
        }
      }}
      onDeleteInvoice={context.deleteInvoice}
      onSavePayment={context.savePayment}
      onBack={() => context.navigate('/dashboard')}
      initialFilters={filters}
    />
  );
};



