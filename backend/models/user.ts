import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  mywatchlist: string[];
  comments: mongoose.Schema.Types.ObjectId[];
  posts: mongoose.Schema.Types.ObjectId[];
}

const UserSchema: Schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true, index: true }, 
  password: { type: String, required: true },
  mywatchlist: { type: [String], default: [] },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }]
});

const User = mongoose.model<IUser>('User', UserSchema);
export default User;
