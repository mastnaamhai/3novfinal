import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  passwordHash: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>('User', UserSchema);
