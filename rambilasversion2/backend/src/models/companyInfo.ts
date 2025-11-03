import { Schema, model, Document } from 'mongoose';

export interface ICompanyInfo extends Document {
  name: string;
  address: string;
  state: string;
  phone1?: string;
  phone2?: string;
  email?: string;
  website?: string;
  gstin?: string;
  pan?: string;
  logo?: string; // Base64 encoded logo
  bankAccounts: Schema.Types.ObjectId[];
  currentBankAccount?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CompanyInfoSchema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  state: { type: String, required: true },
  phone1: { type: String },
  phone2: { type: String },
  email: { type: String },
  website: { type: String },
  gstin: { type: String },
  pan: { type: String },
  logo: { type: String }, // Base64 encoded logo
  bankAccounts: [{ type: Schema.Types.ObjectId, ref: 'BankAccount' }],
  currentBankAccount: { type: Schema.Types.ObjectId, ref: 'BankAccount' },
}, {
  timestamps: true
});

export default model<ICompanyInfo>('CompanyInfo', CompanyInfoSchema);
