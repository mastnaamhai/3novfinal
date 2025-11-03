import { Schema, model, Document, Types } from 'mongoose';
import { GstType, InvoiceStatus } from '../types';
import { IPayment } from './payment';

export interface IInvoice extends Document {
  invoiceNumber: number;
  date: string;
  customer: Types.ObjectId;
  lorryReceipts: Types.ObjectId[];
  totalAmount: number;
  remarks?: string;
  gstType: GstType;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  grandTotal: number;
  isRcm: boolean;
  isManualGst: boolean;
  status: InvoiceStatus;
  payments: (Types.ObjectId | IPayment)[];
  dueDate?: string;
  // Auto-calculated freight fields
  isAutoFreightCalculated: boolean;
  invoiceFreightTotal: number;
  // Separate freight charges fields
  freightCharges?: {
    amount: number;
    paymentType: 'Paid' | 'To Pay' | 'Not Applicable';
    transporterName?: string;
    lrNumber?: string;
  };
  // Virtuals
  paidAmount: number;
  balanceDue: number;
}

const InvoiceSchema = new Schema({
  invoiceNumber: { type: Number, unique: true },
  date: { type: String, required: true },
  customer: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  lorryReceipts: [{ type: Schema.Types.ObjectId, ref: 'LorryReceipt' }],
  totalAmount: { type: Number, required: true },
  remarks: { type: String },
  gstType: { type: String, enum: Object.values(GstType), required: true },
  cgstRate: { type: Number, default: 0 },
  sgstRate: { type: Number, default: 0 },
  igstRate: { type: Number, default: 0 },
  cgstAmount: { type: Number, default: 0 },
  sgstAmount: { type: Number, default: 0 },
  igstAmount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  isRcm: { type: Boolean, default: false },
  isManualGst: { type: Boolean, default: false },
  status: { type: String, enum: Object.values(InvoiceStatus), default: InvoiceStatus.UNPAID },
  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }],
  dueDate: { type: String },
  // Auto-calculated freight fields
  isAutoFreightCalculated: { type: Boolean, default: true },
  invoiceFreightTotal: { type: Number, default: 0 },
  // Separate freight charges fields
  freightCharges: {
    amount: { type: Number, default: 0 },
    paymentType: { 
      type: String, 
      enum: ['Paid', 'To Pay', 'Not Applicable'], 
      default: 'Not Applicable' 
    },
    transporterName: { type: String },
    lrNumber: { type: String }
  },
}, {
  // Ensure virtuals are included when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
InvoiceSchema.index({ customer: 1, date: -1 });
InvoiceSchema.index({ status: 1, date: -1 });
// Note: invoiceNumber index is automatically created by unique: true in schema

// Virtual for total paid amount
InvoiceSchema.virtual('paidAmount').get(function(this: IInvoice) {
  // Ensure payments are populated and it's an array of documents, not just ObjectIDs
  if (this.payments && this.payments.length > 0 && (this.payments[0] as IPayment).amount !== undefined) {
    return this.payments.reduce((total, payment) => total + (payment as IPayment).amount, 0);
  }
  return 0;
});

// Virtual for balance due
InvoiceSchema.virtual('balanceDue').get(function(this: IInvoice) {
  let paidAmount = 0;
  // Ensure payments are populated and it's an array of documents, not just ObjectIDs
  if (this.payments && this.payments.length > 0 && (this.payments[0] as IPayment).amount !== undefined) {
    paidAmount = this.payments.reduce((total, payment) => total + (payment as IPayment).amount, 0);
  }
  return this.grandTotal - paidAmount;
});

// Virtual for customerId to maintain frontend compatibility
InvoiceSchema.virtual('customerId').get(function(this: IInvoice) {
  return this.customer._id || this.customer;
});

// Pre-save middleware to calculate GST amounts
InvoiceSchema.pre('save', function(next) {
  // Only calculate GST if not RCM and not manual GST entry
  if (!this.isRcm && !this.isManualGst) {
    const totalAmount = this.totalAmount || 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    
    if (this.gstType === GstType.CGST_SGST) {
      const gstRate = (this.cgstRate || 0) + (this.sgstRate || 0);
      const gstAmount = (totalAmount * gstRate) / 100;
      cgstAmount = gstAmount / 2;
      sgstAmount = gstAmount / 2;
    } else if (this.gstType === GstType.IGST) {
      const gstRate = this.igstRate || 0;
      igstAmount = (totalAmount * gstRate) / 100;
    }
    
    this.cgstAmount = cgstAmount;
    this.sgstAmount = sgstAmount;
    this.igstAmount = igstAmount;
    this.grandTotal = totalAmount + cgstAmount + sgstAmount + igstAmount;
  } else if (this.isRcm) {
    // For RCM, GST amounts are 0
    this.cgstAmount = 0;
    this.sgstAmount = 0;
    this.igstAmount = 0;
    this.grandTotal = this.totalAmount || 0;
  }
  // For manual GST, use the provided amounts as-is
  
  next();
});

export default model<IInvoice>('Invoice', InvoiceSchema);
