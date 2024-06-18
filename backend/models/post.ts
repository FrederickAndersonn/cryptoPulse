import { Schema, model, Document, Types } from 'mongoose';

interface IPost extends Document {
  author: {
    id: Types.ObjectId;
    username: string;
  };
  heading: string;
  description: string;
  date: Date;
  comments: Types.ObjectId[];
}

const postSchema = new Schema<IPost>({
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: { type: String, required: true }
  },
  heading: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

export default model<IPost>('Post', postSchema);
