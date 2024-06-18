import mongoose, { Schema, Document, Types } from 'mongoose';

interface IComment extends Document {
  author: {
    id: Types.ObjectId;
    username: string;
  };
  text: string;
  date: Date;
  post: {
    id: Types.ObjectId;
  };
}

const commentSchema: Schema<IComment> = new mongoose.Schema({
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
  text: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  post: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post',
      required: true
    }
  }
});

export default mongoose.model<IComment>('Comment', commentSchema);
