import { Schema, model, Document } from 'mongoose';
import { THNStatus } from '../types';

export interface ITruckHiringNote extends Document {
  thnNumber: number;
  date: string;
  truckNumber: string;
  truckType: string;
  vehicleCapacity: number;
  loadingLocation: string;
  unloadingLocation: string;
  loadingDateTime: string;
  expectedDeliveryDate: string;
  goodsType: string;
  agencyName: string;
  truckOwnerName: string;
  truckOwnerContact?: string;
  freightRate: number;
  freightRateType: 'per_trip' | 'per_ton' | 'per_km';
  advanceAmount: number;
  balanceAmount: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque' | 'Other';
  paymentTerms: string;
  additionalCharges?: number;
  remarks?: string;
  linkedLR?: string;
  linkedInvoice?: string;
  status: THNStatus;
  paidAmount: number;
  payments: Schema.Types.ObjectId[];
}

const TruckHiringNoteSchema = new Schema({
  thnNumber: { type: Number, unique: true, required: true },
  date: { type: String, required: true },
  truckNumber: { type: String, required: true },
  truckType: { type: String, required: true },
  vehicleCapacity: { type: Number, required: true },
  loadingLocation: { type: String, required: true },
  unloadingLocation: { type: String, required: true },
  loadingDateTime: { type: String, required: true },
  expectedDeliveryDate: { type: String, required: true },
  goodsType: { type: String, required: true },
  agencyName: { type: String, required: true },
  truckOwnerName: { type: String, required: true },
  truckOwnerContact: { type: String },
  freightRate: { type: Number, required: true },
  freightRateType: { 
    type: String, 
    enum: ['per_trip', 'per_ton', 'per_km'], 
    default: 'per_trip',
    required: true 
  },
  advanceAmount: { type: Number, default: 0 },
  balanceAmount: { type: Number, required: true },
  paymentMode: { 
    type: String, 
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Cheque', 'Other'], 
    required: true 
  },
  paymentTerms: { type: String },
  additionalCharges: { type: Number, default: 0 },
  remarks: { type: String },
  linkedLR: { type: String },
  linkedInvoice: { type: String },
  status: { 
    type: String, 
    enum: Object.values(THNStatus), 
    default: THNStatus.UNPAID 
  },
  paidAmount: { type: Number, default: 0 },
  payments: [{ type: Schema.Types.ObjectId, ref: 'Payment' }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for total amount (freight + additional charges)
TruckHiringNoteSchema.virtual('totalAmount').get(function(this: ITruckHiringNote) {
  return this.freightRate + (this.additionalCharges || 0);
});

export default model<ITruckHiringNote>('TruckHiringNote', TruckHiringNoteSchema);
