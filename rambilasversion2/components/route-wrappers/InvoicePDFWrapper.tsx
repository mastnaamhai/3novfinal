import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { InvoicePDF } from '../InvoicePDF';

export const InvoicePDFWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  const { id } = useParams();
  
  const invoice = context.invoices.find((inv: any) => inv._id === id);
  
  if (!invoice) {
    return <div>Invoice not found</div>;
  }
  
  return (
    <InvoicePDF 
      invoice={invoice} 
      companyInfo={context.companyInfo} 
      customers={context.customers} 
      onBack={() => context.navigate('/invoices')} 
    />
  );
};



