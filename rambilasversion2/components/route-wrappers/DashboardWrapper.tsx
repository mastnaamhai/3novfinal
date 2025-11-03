import { useOutletContext } from 'react-router-dom';
import { Dashboard } from '../Dashboard';

export const DashboardWrapper = () => {
  const context = useOutletContext<any>();
  
  return (
    <Dashboard 
      lorryReceipts={context.lorryReceipts} 
      invoices={context.invoices}
      payments={context.payments}
      truckHiringNotes={context.truckHiringNotes}
      onViewChange={(view) => {
        // Convert old view format to new route format
        switch (view.name) {
          case 'LORRY_RECEIPTS':
            context.navigate('/lorry-receipts');
            break;
          case 'INVOICES':
            context.navigate('/invoices');
            break;
          case 'PENDING_PAYMENTS':
            context.navigate('/payments');
            break;
          case 'ENHANCED_LEDGER':
            context.navigate('/enhanced-ledger');
            break;
          case 'CLIENTS':
            context.navigate('/clients');
            break;
          case 'TRUCK_HIRING_NOTES':
            context.navigate('/truck-hiring');
            break;
          case 'SETTINGS':
            context.navigate('/settings');
            break;
          case 'CREATE_LR':
            context.navigate('/lorry-receipts/create');
            break;
          case 'CREATE_INVOICE':
            context.navigate('/invoices/create');
            break;
          case 'CREATE_INVOICE_FROM_LR':
            context.navigate(`/invoices/create-from-lr/${view.lrId}`);
            break;
          case 'EDIT_LR':
            context.navigate(`/lorry-receipts/edit/${view.id}`);
            break;
          case 'VIEW_LR':
            context.navigate(`/lorry-receipts/view/${view.id}`);
            break;
          case 'EDIT_INVOICE':
            context.navigate(`/invoices/edit/${view.id}`);
            break;
          case 'VIEW_INVOICE':
            context.navigate(`/invoices/view/${view.id}`);
            break;
          case 'VIEW_THN':
            context.navigate(`/truck-hiring/view/${view.id}`);
            break;
          default:
            context.navigate('/dashboard');
        }
      }}
      onUpdateLrStatus={context.updateLrStatus}
      onDeleteLr={context.deleteLr}
      onDeleteInvoice={context.deleteInvoice}
      onSavePayment={context.savePayment}
    />
  );
};



