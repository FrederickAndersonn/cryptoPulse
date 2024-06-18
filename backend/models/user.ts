import mongoose, { Document, Schema, Types } from 'mongoose';

export interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  publicKey: string;
  secretKey: string;
  initialBalance: number;
  comments: Types.ObjectId[];
  posts: Types.ObjectId[];
}

const UserSchema: Schema<UserDocument> = new mongoose.Schema({
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
  initialBalance: {
    type: Number,
    required: true,
    default: 0,
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
});

export default mongoose.model<UserDocument>('User', UserSchema);
