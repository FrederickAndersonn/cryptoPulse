import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
const router = express.Router();
import User from '../models/user';
import Comment from '../models/comment';
import Post from '../models/post';
import jwt from 'jsonwebtoken';

const getUserIdFromToken = (req: Request): string | null => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded: any = jwt.verify(token, 'my secret token'); // Use your JWT secret
    return decoded.user.id;
  } catch (err) {
    return null;
  }
};

router.post('/create', async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  const postId = req.header('postid') as string;

  if (!userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).send('User not found');
    }
    const post = await Post.findById(postId).exec();
    if (!post) {
      return res.status(404).send('Post not found');
    }
    const newComment = new Comment(req.body);
    newComment.author.id = new Types.ObjectId(userId);
    newComment.author.username = user.name;
    newComment.post.id = new Types.ObjectId(postId);
    await newComment.save();

    // Update user's comments array
    user.comments.push(newComment._id);
    await user.save();

    post.comments.push(newComment._id); // Push the comment's _id instead of the comment itself
    await post.save();

    res.status(200).send("Comment created and linked to user and post");
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
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
    console.log(err);
    res.status(500).send(err);
  }
});

router.put('/editcomment', async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  const commentId = req.header('commentid') as string;
  const commentauthorid = req.header('commentauthorid') as string;

  if (userId !== commentauthorid) {
    return res.status(403).send('Unauthorized');
  }

  try {
    const foundComment = await Comment.findByIdAndUpdate(commentId, { text: req.body.text }).exec();
    if (!foundComment) {
      res.status(404).send('Comment not found');
      return;
    }
    await foundComment.save();
    res.status(200).send("Comment updated");
  } catch (err) {
    res.status(500).send(err);
  }
});

router.delete('/deletecomment', async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  const commentId = req.header('commentid') as string;
  const commentauthorid = req.header('commentauthorid') as string;

  if (userId !== commentauthorid) {
    return res.status(403).send('Unauthorized');
  }

  try {
    const foundComment = await Comment.findByIdAndDelete(commentId).exec();
    if (!foundComment) {
      res.status(404).send('Comment not found');
      return;
    }
    res.status(200).send('Comment deleted');
  } catch (err) {
    res.status(500).send(err);
  }
});

// Like a comment
router.post('/:commentId/like', async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).send('Comment not found');
    }
    if (comment.likedBy.includes(new Types.ObjectId(userId))) {
      return res.status(400).send('User has already liked this comment');
    }
    comment.likes += 1;
    comment.likedBy.push(new Types.ObjectId(userId));
    await comment.save();
    res.json(comment);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Unlike a comment
router.post('/:commentId/unlike', async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) {
      return res.status(404).send('Comment not found');
    }
    if (!comment.likedBy.includes(new Types.ObjectId(userId))) {
      return res.status(400).send('User has not liked this comment');
    }
    comment.likes = Math.max(comment.likes - 1, 0); // Ensure likes don't go negative
    comment.likedBy = comment.likedBy.filter((id) => !id.equals(new Types.ObjectId(userId)));
    await comment.save();
    res.json(comment);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});
export default router;
