import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { LorryReceiptPDF } from '../LorryReceiptPDF';

export const LorryReceiptPDFWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  const { id } = useParams();
  
  const lorryReceipt = context.lorryReceipts.find((lr: any) => lr._id === id);
  
  if (!lorryReceipt) {
    return <div>Lorry Receipt not found</div>;
  }
  
  return (
    <LorryReceiptPDF 
      lorryReceipt={lorryReceipt} 
      companyInfo={context.companyInfo} 
      onBack={() => context.navigate('/lorry-receipts')} 
    />
  );
};



