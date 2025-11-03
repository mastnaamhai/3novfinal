import Invoice from '../models/invoice';
import Payment from '../models/payment';
import LorryReceipt from '../models/lorryReceipt';
import { InvoiceStatus, LorryReceiptStatus } from '../types';

export const updateInvoiceStatus = async (invoiceId: string) => {
  try {
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      // Invoice might have been deleted, so we just log this.
      console.log(`Invoice with ID ${invoiceId} not found for status update.`);
      return;
    }

    const payments = await Payment.find({ invoiceId: invoiceId });
    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

    let newStatus: InvoiceStatus;
    if (totalPaid >= invoice.grandTotal) {
      newStatus = InvoiceStatus.PAID;
    } else if (totalPaid > 0) {
      newStatus = InvoiceStatus.PARTIALLY_PAID;
    } else {
      newStatus = InvoiceStatus.UNPAID;
    }

    if (invoice.status !== newStatus) {
      invoice.status = newStatus;
      await invoice.save();

      // If the invoice is now paid, update all associated LRs to be paid as well.
      if (newStatus === InvoiceStatus.PAID) {
        await LorryReceipt.updateMany(
          { _id: { $in: invoice.lorryReceipts } },
          { $set: { status: LorryReceiptStatus.PAID } }
        );
      }
    }
  } catch (error) {
    console.error(`Failed to update status for invoice ${invoiceId}:`, error);
    // We don't re-throw the error because this is a background task
    // and shouldn't fail the main API request.
  }
};
