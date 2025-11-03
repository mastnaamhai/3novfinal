import mongoose, { Document, Schema } from 'mongoose';

export interface IApiKey extends Document {
  keyType: 'gstin' | 'other';
  keyValue: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ApiKeySchema = new Schema<IApiKey>({
  keyType: {
    type: String,
    enum: ['gstin', 'other'],
    required: true
  },
  keyValue: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Ensure only one active key per type
ApiKeySchema.index({ keyType: 1, isActive: 1 }, { unique: true, partialFilterExpression: { isActive: true } });

export default mongoose.model<IApiKey>('ApiKey', ApiKeySchema);
