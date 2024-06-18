import { Schema, model, Document, Types } from 'mongoose';

interface IComment extends Document {
  author: {
    id: Types.ObjectId;
    username: string;
  };
  text: string;
  date: Date;
  likes: number,
  likedBy: Types.ObjectId[];
  post: {
    id: Types.ObjectId;
  };
}

const commentSchema = new Schema<IComment>({
  author: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    username: { type: String, required: true }
  },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  post: {
    id: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    }
  }
});

export default model<IComment>('Comment', commentSchema);
