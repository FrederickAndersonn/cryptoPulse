import mongoose, { Schema, Document, Types } from 'mongoose';

interface IPost extends Document {
  author: {
    id: Types.ObjectId;
    username: string;
  };
  Heading: string;
  description: string;
  date: Date;
  comments: Types.ObjectId[];
}

const postSchema: Schema<IPost> = new mongoose.Schema({
  author: {
    id: {
      type: Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: {
      type: String,
      required: true
    }
  },
  Heading: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  comments: [
    {
      type: Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

export default mongoose.model<IPost>('Post', postSchema);
