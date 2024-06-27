import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
import jwt, { JwtPayload } from 'jsonwebtoken';
const router = express.Router();
import User from '../models/user';
import Post from '../models/post';
// Removed unused import 'Comment'

interface DecodedToken extends JwtPayload {
  user: {
    id: string;
  };
}

// Helper function to extract user ID from JWT token
const getUserIdFromToken = (req: Request): string | null => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, 'my secret token') as DecodedToken; // Use your JWT secret
    return decoded.user.id;
  } catch (err) {
    return null;
  }
};

// Get all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().populate('author.id', 'name publicKey');
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
        publicKey: user.publicKey, // Include publicKey here
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

// Upvote or Downvote a post
router.post('/posts/:postId/vote', async (req: Request, res: Response) => {
  const userId = getUserIdFromToken(req);
  const { vote } = req.body; // Expect vote to be 1 for upvote and -1 for downvote
  if (!userId) {
    return res.status(401).send('Unauthorized');
  }

  if (![1, -1].includes(vote)) {
    return res.status(400).send('Invalid vote value');
  }

  try {
    const post = await Post.findById(req.params.postId);
    if (!post) {
      return res.status(404).send('Post not found');
    }

    const userObjectId = new Types.ObjectId(userId);
    const existingVote = post.votedBy.find(v => v.userId.equals(userObjectId));

    if (existingVote) {
      if (existingVote.vote === vote) {
        // User is toggling the same vote, so remove the vote
        post.votes -= vote;
        post.votedBy = post.votedBy.filter(v => !v.userId.equals(userObjectId));
      } else {
        // User is switching vote, so adjust the vote accordingly
        post.votes += 2 * vote; // because it's effectively changing from -1 to +1 or vice versa
        existingVote.vote = vote;
      }
    } else {
      // User is voting for the first time
      post.votes += vote;
      post.votedBy.push({ userId: userObjectId, vote });
    }

    await post.save();
    res.json(post);
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(err.message);
    }
    res.status(500).send('Server Error');
  }
});

export default router;
