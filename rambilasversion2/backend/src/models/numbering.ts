import { Schema, model, Document } from 'mongoose';

export interface INumberingConfig extends Document {
  type: 'invoice' | 'consignment';
  startingNumber: number;
  currentNumber: number;
  prefix: string;
  createdAt: Date;
  updatedAt: Date;
}

const NumberingConfigSchema = new Schema({
  type: { type: String, required: true, enum: ['invoice', 'consignment'] },
  startingNumber: { type: Number, required: true },
  currentNumber: { type: Number, required: true },
  prefix: { type: String, required: true, default: '' },
}, {
  timestamps: true // This adds createdAt and updatedAt automatically
});

export default model<INumberingConfig>('NumberingConfig', NumberingConfigSchema);


