import { Schema, model, Document } from 'mongoose';
import { Customer as ICustomerType } from '../types';

export interface ICustomer extends Omit<ICustomerType, '_id'>, Document {}

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  tradeName: { type: String },
  address: { type: String },
  state: { type: String },
  gstin: { type: String, unique: true, sparse: true }, // Unique but allow null values
  contactPerson: { type: String },
  contactPhone: { type: String },
  contactEmail: { type: String },
  city: { type: String },
  pin: { type: String },
  phone: { type: String },
  email: { type: String },
  // Add metadata for GSTIN caching
  gstinLastVerified: { type: Date },
  gstinSource: { type: String, enum: ['api', 'manual'], default: 'manual' },
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Note: GSTIN index is automatically created by unique: true in schema

export default model<ICustomer>('Customer', CustomerSchema);
