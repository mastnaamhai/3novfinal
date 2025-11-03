import type { LorryReceipt, Invoice, Payment, Customer, TruckHiringNote } from '../../types';
import { EnhancedExportInterface } from '../EnhancedExportInterface';

interface AdvancedExportsProps {
  lorryReceipts: LorryReceipt[];
  invoices: Invoice[];
  payments: Payment[];
  customers: Customer[];
  truckHiringNotes: TruckHiringNote[];
}

export const AdvancedExports = (props: AdvancedExportsProps) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800">Advanced Exports</h3>
        <p className="text-gray-600 mt-1">Custom exports with filters, templates, and multiple formats</p>
      </div>

      <EnhancedExportInterface
        customers={props.customers}
        lorryReceipts={props.lorryReceipts}
        invoices={props.invoices}
        payments={props.payments}
        truckHiringNotes={props.truckHiringNotes}
        onBack={() => {}} // Not needed in this context
      />
    </div>
  );
};
