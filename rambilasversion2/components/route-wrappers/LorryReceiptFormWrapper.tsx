import React from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { LorryReceiptForm } from '../LorryReceiptForm';

export const LorryReceiptFormWrapper: React.FC = () => {
  const context = useOutletContext<any>();
  const { id } = useParams();
  
  const existingLr = id ? context.lorryReceipts.find((lr: any) => lr._id === id) : undefined;
  
  const handleSave = async (lr: any) => {
    try {
      await context.saveLorryReceipt(lr);
      context.pushToast('success', 'Lorry Receipt saved successfully');
      context.navigate('/lorry-receipts');
    } catch (error) {
      context.handleAndToastApiError(error, 'Failed to save lorry receipt');
      throw error;
    }
  };
  
  return (
    <LorryReceiptForm 
      onSave={handleSave} 
      onCancel={() => context.navigate('/lorry-receipts')} 
      customers={context.customers} 
      truckHiringNotes={context.truckHiringNotes} 
      onSaveCustomer={context.saveCustomer} 
      onRefreshCustomers={async () => {
        await context.fetchCustomers();
        return context.customers;
      }}
      existingLr={existingLr}
    />
  );
};



