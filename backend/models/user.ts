// ../models/user.ts

import mongoose, { Document } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  publicKey: string;
  secretKey: string;
  initialBalance: number;
}

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: false,
  },
  secretKey: {
    type: String,
    required: false,
  }
});

export default mongoose.model<UserDocument>('User', UserSchema);
