import { useOutletContext, useParams } from 'react-router-dom';
import { InvoiceForm } from '../InvoiceForm';
import { LorryReceiptStatus } from '../../types';

export const InvoiceFormWrapper = () => {
  const context = useOutletContext<any>();
  const { id, lrId } = useParams();
  
  const existingInvoice = id ? context.invoices.find((inv: any) => inv._id === id) : undefined;
  const preselectedLr = lrId ? context.lorryReceipts.find((lr: any) => lr._id === lrId) : undefined;
  
  // Get available LRs based on context
  let availableLrs = context.lorryReceipts.filter((lr: any) => 
    [LorryReceiptStatus.CREATED, LorryReceiptStatus.IN_TRANSIT, LorryReceiptStatus.DELIVERED].includes(lr.status)
  );
  
  if (lrId) {
    // Include the preselected LR even if it's already invoiced
    availableLrs = context.lorryReceipts.filter((lr: any) => 
      [LorryReceiptStatus.CREATED, LorryReceiptStatus.IN_TRANSIT, LorryReceiptStatus.DELIVERED].includes(lr.status) || lr._id === lrId
    );
  } else if (existingInvoice) {
    // For editing, include LRs that are already in this invoice
    availableLrs = context.lorryReceipts.filter((lr: any) => 
      (lr.status !== LorryReceiptStatus.INVOICED && lr.status !== LorryReceiptStatus.PAID) || 
      existingInvoice.lorryReceipts?.some((ilr: any) => ilr._id === lr._id)
    );
  }
  
  const handleSave = async (invoice: any) => {
    try {
      await context.saveInvoice(invoice);
      context.pushToast('success', 'Invoice saved successfully');
      context.navigate('/invoices');
    } catch (error) {
      context.handleAndToastApiError(error, 'Failed to save invoice');
      throw error;
    }
  };
  
  return (
    <InvoiceForm 
      onSave={handleSave} 
      onCancel={() => context.navigate('/invoices')} 
      availableLrs={availableLrs} 
      customers={context.customers} 
      onSaveCustomer={context.saveCustomer}
      existingInvoice={existingInvoice}
      preselectedLr={preselectedLr}
      companyInfo={context.companyInfo}
    />
  );
};



