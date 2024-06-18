import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import jwt from 'jsonwebtoken';
const router = express.Router();
import User from '../models/user';
import Post from '../models/post';
import Comment from '../models/comment';

// Helper function to extract user ID from JWT token
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

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author.id', 'name');
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).send('Server error');
  }
});

// Get all posts by a user
router.get('/users/:userId/posts', async (req, res) => {
  try {
    const posts = await Post.find({ 'author.id': req.params.userId });
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).send('Server error');
  }
});

// Get a single post
router.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate({
      path: 'comments',
      populate: { path: 'author.id', select: 'name' }
    }).exec();
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.json(post);
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send('Server error');
  }
});

// Create a new post
router.post('/posts', async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }

  try {
    console.log('Creating a new post with data:', req.body);
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found');
    }

    const newPost = new Post({
      ...req.body,
      author: {
        id: new Types.ObjectId(userId),
        username: user.name,
      },
    });

    await newPost.save();

    // Update user's posts array
    user.posts.push(newPost._id);
    await user.save();

    console.log('Post created successfully:', newPost);
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).send(error);
  }
});

// Update a post
router.put('/posts/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);

  try {
    console.log(`Updating post with id: ${req.params.id} with data:`, req.body);
    const post = await Post.findById(req.params.id);

    if (!post) {
      console.log('Post not found');
      return res.status(404).send('Post not found');
    }

    if (post.author.id.toString() !== userId) {
      return res.status(403).send('Unauthorized');
    }

    const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log('Post updated successfully:', updatedPost);
    res.json(updatedPost);
  } catch (error) {
    console.error(`Error updating post with id ${req.params.id}:`, error);
    res.status(500).send(error);
  }
});

// Delete a post
router.delete('/posts/:id', async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);

  try {
    console.log(`Deleting post with id: ${req.params.id}`);
    const post = await Post.findById(req.params.id);

    if (!post) {
      console.log('Post not found');
      return res.status(404).send('Post not found');
    }

    if (post.author.id.toString() !== userId) {
      return res.status(403).send('Unauthorized');
    }

    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    console.log('Post deleted successfully:', deletedPost);

    // Remove post reference from user
    await User.findByIdAndUpdate(userId, { $pull: { posts: req.params.id } });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error(`Error deleting post with id ${req.params.id}:`, error);
    res.status(500).send(error);
  }
});

export default router;
