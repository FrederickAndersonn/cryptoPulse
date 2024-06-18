import mongoose, { Schema, Document } from 'mongoose';

interface IPost extends Document {
  author: {
    id: mongoose.Schema.Types.ObjectId;
    username: string;
  };
  Heading: string;
  description: string;
  date: Date;
  comments: mongoose.Schema.Types.ObjectId[];
}

const postSchema: Schema<IPost> = new mongoose.Schema({
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
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
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

export default mongoose.model<IPost>('post', postSchema);
