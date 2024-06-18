import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
const router = express.Router();
import User from '../models/user';
import Post from '../models/post';
import Comment from '../models/comment';

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
    try {
      console.log('Creating a new post with data:', req.body);
      const newPost = new Post(req.body);
      await newPost.save();
      console.log('Post created successfully:', newPost);
      res.status(201).json(newPost);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).send(error);
    }
  });
  
  // Update a post
  router.put('/posts/:id', async (req: Request, res: Response) => {
    try {
      console.log(`Updating post with id: ${req.params.id} with data:`, req.body);
      const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedPost) {
        console.log('Post not found');
        return res.status(404).send('Post not found');
      }
      console.log('Post updated successfully:', updatedPost);
      res.json(updatedPost);
    } catch (error) {
      console.error(`Error updating post with id ${req.params.id}:`, error);
      res.status(500).send(error);
    }
  });
  
  // Delete a post
  router.delete('/posts/:id', async (req: Request, res: Response) => {
    try {
      console.log(`Deleting post with id: ${req.params.id}`);
      const deletedPost = await Post.findByIdAndDelete(req.params.id);
      if (!deletedPost) {
        console.log('Post not found');
        return res.status(404).send('Post not found');
      }
      console.log('Post deleted successfully:', deletedPost);
      res.json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error(`Error deleting post with id ${req.params.id}:`, error);
      res.status(500).send(error);
    }
  });

export default router;
