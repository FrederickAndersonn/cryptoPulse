import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/user';
import Comment from '../models/comment';
import Post from '../models/post';

const router = express.Router();

router.post('/create', async (req: Request, res: Response) => {
  const userId = req.header('userid') as string;
  const postId = req.header('postid') as string;

  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      res.status(404).send('User not found');
      return;
    }

    const post = await Post.findById(postId).exec();
    if (!post) {
      res.status(404).send('Post not found');
      return;
    }

    const comment = new Comment(req.body);
    comment.author.id = new mongoose.Types.ObjectId(userId);
    comment.author.username = user.name;
    comment.post.id = new mongoose.Types.ObjectId(postId);

    await comment.save();

    user.comments.push(comment._id);
    await user.save();

    post.comments.push(comment._id);
    await post.save();

    res.status(200).send("Comment created and linked to user and post");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.get('/getcomments', async (req: Request, res: Response) => {
  const postId = req.header('postid') as string;

  try {
    const post = await Post.findById(postId).populate('comments').exec();
    if (!post) {
      res.status(404).send('Post not found');
      return;
    }

    res.status(200).send(post.comments);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.put('/editcomment', async (req: Request, res: Response) => {
  const userId = req.header('userid') as string;
  const commentId = req.header('commentid') as string;
  const commentAuthorId = req.header('commentauthorid') as string;

  if (userId !== commentAuthorId) {
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const comment = await Comment.findByIdAndUpdate(commentId, { text: req.body.text }, { new: true }).exec();
    if (!comment) {
      res.status(404).send('Comment not found');
      return;
    }

    res.status(200).send("Comment updated");
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

router.delete('/deletecomment', async (req: Request, res: Response) => {
  const userId = req.header('userid') as string;
  const commentId = req.header('commentid') as string;
  const commentAuthorId = req.header('commentauthorid') as string;

  if (userId !== commentAuthorId) {
    res.status(403).send('Unauthorized');
    return;
  }

  try {
    const comment = await Comment.findByIdAndDelete(commentId).exec();
    if (!comment) {
      res.status(404).send('Comment not found');
      return;
    }

    await User.updateOne({ _id: userId }, { $pull: { comments: comment._id } }).exec();
    await Post.updateOne({ _id: comment.post.id }, { $pull: { comments: comment._id } }).exec();

    res.status(200).send('Comment deleted');
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});

export default router;
