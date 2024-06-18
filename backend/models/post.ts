import { Schema, model, Document, Types } from 'mongoose';

interface IPost extends Document {
  author: {
    id: Types.ObjectId;
    username: string;
    publicKey: string;
  };
  heading: string;
  description: string;
  date: Date;
  comments: Types.ObjectId[];
  votes: number;
  votedBy: { userId: Types.ObjectId; vote: number }[];
}

const postSchema = new Schema<IPost>({
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: { type: String, required: true },
    publicKey: { type: String, required: true } // New attribute
  },
  heading: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, default: Date.now },
  votes: { type: Number, default: 0 },
  votedBy: [
    {
      userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      vote: { type: Number, required: true }
    }
  ],
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
  
});

export default model<IPost>('Post', postSchema);
