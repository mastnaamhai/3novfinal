import React from 'react';
import { useOutletContext, useSearchParams } from 'react-router-dom';
import { LorryReceipts } from '../LorryReceipts';

export const LorryReceiptsWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  const [searchParams] = useSearchParams();
  
  // Convert search params to filters format
  const filters = {
    status: searchParams.get('status') || undefined,
    customer: searchParams.get('customer') || undefined,
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  };
  
  return (
    <LorryReceipts
      lorryReceipts={context.lorryReceipts}
      invoices={context.invoices}
      customers={context.customers}
      companyInfo={context.companyInfo}
      onViewChange={(view) => {
        switch (view.name) {
          case 'CREATE_LR':
            context.navigate('/lorry-receipts/create');
            break;
          case 'EDIT_LR':
            context.navigate(`/lorry-receipts/edit/${view.id}`);
            break;
          case 'VIEW_LR':
            context.navigate(`/lorry-receipts/view/${view.id}`);
            break;
          case 'CREATE_INVOICE_FROM_LR':
            context.navigate(`/invoices/create-from-lr/${view.lrId}`);
            break;
          default:
            context.navigate('/lorry-receipts');
        }
      }}
      onUpdateLrStatus={context.updateLrStatus}
      onDeleteLr={context.deleteLr}
      onBack={() => context.navigate('/dashboard')}
      initialFilters={filters}
    />
  );
};



