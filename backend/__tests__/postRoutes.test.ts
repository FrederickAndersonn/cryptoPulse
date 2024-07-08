import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import postRoutes from '../routes/postRoutes';
import User from '../models/user';
import Post from '../models/post';

const app = express();
app.use(express.json());
app.use('/api', postRoutes);

jest.mock('../models/user');
jest.mock('../models/post');
jest.mock('jsonwebtoken');

describe('Post Routes', () => {
  const mockUserId = new mongoose.Types.ObjectId().toString();
  const mockPostId = new mongoose.Types.ObjectId().toString();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/posts', () => {
    it('should return all posts', async () => {
      const mockPosts = [{ id: mockPostId, title: 'Test Post' }];
      (Post.find as jest.Mock).mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockPosts),
      });

      const res = await request(app).get('/api/posts');

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPosts);
    });
  });

  describe('GET /api/users/:userId/posts', () => {
    it('should return all posts by a user', async () => {
      const mockUserPosts = [{ id: mockPostId, title: 'User Post' }];
      (Post.find as jest.Mock).mockResolvedValue(mockUserPosts);

      const res = await request(app).get(`/api/users/${mockUserId}/posts`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUserPosts);
    });
  });

  describe('GET /api/posts/:id', () => {
    it('should return a single post', async () => {
      const mockPost = { id: mockPostId, title: 'Single Post' };
      (Post.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockPost),
        }),
      });

      const res = await request(app).get(`/api/posts/${mockPostId}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockPost);
    });
  });

  describe('PUT /api/posts/:id', () => {
    it('should update a post', async () => {
      const mockToken = 'mock-token';
      const mockUpdatedPost = { id: mockPostId, title: 'Updated Post' };

      (jwt.verify as jest.Mock).mockReturnValue({ user: { id: mockUserId } });
      (Post.findById as jest.Mock).mockResolvedValue({ author: { id: mockUserId } });
      (Post.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUpdatedPost);

      const res = await request(app)
        .put(`/api/posts/${mockPostId}`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send(mockUpdatedPost);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUpdatedPost);
    });
  });

  describe('DELETE /api/posts/:id', () => {
    it('should delete a post', async () => {
      const mockToken = 'mock-token';

      (jwt.verify as jest.Mock).mockReturnValue({ user: { id: mockUserId } });
      (Post.findById as jest.Mock).mockResolvedValue({ author: { id: mockUserId } });
      (Post.findByIdAndDelete as jest.Mock).mockResolvedValue({});
      (User.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

      const res = await request(app)
        .delete(`/api/posts/${mockPostId}`)
        .set('Authorization', `Bearer ${mockToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'Post deleted successfully' });
    });
  });

  describe('POST /api/posts/:postId/vote', () => {
    it('should upvote a post', async () => {
      const mockToken = 'mock-token';
      const mockPost = {
        id: mockPostId,
        votes: 0,
        votedBy: [],
        save: jest.fn(),
      };

      (jwt.verify as jest.Mock).mockReturnValue({ user: { id: mockUserId } });
      (Post.findById as jest.Mock).mockResolvedValue(mockPost);

      const res = await request(app)
        .post(`/api/posts/${mockPostId}/vote`)
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ vote: 1 });

      expect(res.status).toBe(200);
      expect(mockPost.votes).toBe(1);
      expect(mockPost.votedBy.length).toBe(1);
      expect(mockPost.save).toHaveBeenCalled();
    });
  });
});