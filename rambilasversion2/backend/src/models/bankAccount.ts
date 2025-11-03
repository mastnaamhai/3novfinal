import { Schema, model, Document } from 'mongoose';

export interface IBankAccount extends Document {
  accountName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  branch: string;
  accountType: 'Savings' | 'Current' | 'Fixed Deposit' | 'Recurring Deposit';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema({
  accountName: { type: String, required: true },
  bankName: { type: String, required: true },
  accountNumber: { type: String, required: true },
  ifscCode: { type: String, required: true },
  branch: { type: String, required: true },
  accountType: { 
    type: String, 
    enum: ['Savings', 'Current', 'Fixed Deposit', 'Recurring Deposit'],
    default: 'Current'
  },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

export default model<IBankAccount>('BankAccount', BankAccountSchema);
