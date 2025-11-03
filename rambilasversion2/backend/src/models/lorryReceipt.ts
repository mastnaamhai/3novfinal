import { Schema, model, Document } from 'mongoose';
import { LorryReceiptStatus, GstPayableBy, RiskBearer } from '../types';

export interface ILorryReceipt extends Document {
  lrNumber: number;
  date: string;
  reportingDate?: string;
  deliveryDate?: string;
  consignor: Schema.Types.ObjectId;
  consignee: Schema.Types.ObjectId;
  vehicleNumber: string;
  from: string;
  to: string;
  loadingAddress?: string;
  deliveryAddress?: string;
  packages: {
    count: number;
    packingMethod: string;
    description: string;
    actualWeight: number;
    chargedWeight: number;
  }[];
  charges: {
    freight?: number;
    aoc: number;
    hamali: number;
    bCh: number;
    trCh: number;
    detentionCh: number;
  };
  totalAmount: number;
  eWayBillNo: string;
  eWayBillValidUpto?: string;
  valueGoods: number;
  gstPayableBy: GstPayableBy;
  riskBearer: RiskBearer;
  status: LorryReceiptStatus;
  insurance: {
    hasInsured: boolean;
    company?: string;
    policyNo?: string;
    date?: string;
    amount?: number;
    risk?: string;
  };
  invoiceNo: string;
  sealNo: string;
  truckRental?: Schema.Types.ObjectId;
  rentalCost?: number;
  rentalUsageValue?: number;
}

const LorryReceiptSchema = new Schema({
  lrNumber: { type: Number, unique: true },
  date: { type: String, required: true },
  reportingDate: { type: String },
  deliveryDate: { type: String },
  consignor: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  consignee: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
  vehicleNumber: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  loadingAddress: { type: String },
  deliveryAddress: { type: String },
  packages: [
    {
      count: { type: Number, required: true },
      packingMethod: { type: String, required: true },
      description: { type: String, required: true },
      actualWeight: { type: Number, required: true },
      chargedWeight: { type: Number, required: true },
    },
  ],
  charges: {
    freight: { type: Number, default: 0, required: false },
    aoc: { type: Number, default: 0 },
    hamali: { type: Number, default: 0 },
    bCh: { type: Number, default: 0 },
    trCh: { type: Number, default: 0 },
    detentionCh: { type: Number, default: 0 },
  },
  totalAmount: { type: Number, required: true },
  eWayBillNo: { type: String },
  eWayBillValidUpto: { type: String },
  valueGoods: { type: Number },
  gstPayableBy: { type: String, enum: Object.values(GstPayableBy), required: true },
  riskBearer: { type: String, enum: Object.values(RiskBearer), required: true },
  status: { type: String, enum: Object.values(LorryReceiptStatus), default: LorryReceiptStatus.CREATED },
  insurance: {
    hasInsured: { type: Boolean, default: false },
    company: { type: String },
    policyNo: { type: String },
    date: { type: String },
    amount: { type: Number },
    risk: { type: String },
  },
  invoiceNo: { type: String },
  sealNo: { type: String },
  truckRental: { type: Schema.Types.ObjectId, ref: 'TruckRental' },
  rentalCost: { type: Number },
  rentalUsageValue: { type: Number },
});

// Indexes for common queries
LorryReceiptSchema.index({ date: -1, status: 1 });
LorryReceiptSchema.index({ consignor: 1, date: -1 });
LorryReceiptSchema.index({ consignee: 1, date: -1 });
// Note: lrNumber index is automatically created by unique: true in schema
// Text index for simple search on from/to
LorryReceiptSchema.index({ from: 'text', to: 'text' });

export default model<ILorryReceipt>('LorryReceipt', LorryReceiptSchema);
