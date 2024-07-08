import express from 'express';
import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import commentRoutes from '../routes/commentRoutes';
import Comment from '../models/comment';
import Post from '../models/post';

// Mock the models
jest.mock('../models/user');
jest.mock('../models/comment');
jest.mock('../models/post');

// Mock jwt
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/api/comments', commentRoutes);

describe('Comment Routes', () => {
  const mockUserId = new mongoose.Types.ObjectId();
  const mockPostId = new mongoose.Types.ObjectId();
  const mockCommentId = new mongoose.Types.ObjectId();

  beforeEach(() => {
    jest.clearAllMocks();
    (jwt.verify as jest.Mock).mockReturnValue({ user: { id: mockUserId.toString() } });
  });

  describe('POST /create', () => {
    // it('should create a new comment', async () => {
    //   const mockUser = { _id: mockUserId, name: 'Test User', comments: [], save: jest.fn() };
    //   const mockPost = { _id: mockPostId, comments: [], save: jest.fn() };
    //   const mockComment = { _id: mockCommentId, save: jest.fn() };

    //   (User.findById as jest.Mock).mockResolvedValue(mockUser);
    //   (Post.findById as jest.Mock).mockResolvedValue(mockPost);
    //   (Comment as any).mockImplementation(() => mockComment);

    //   const response = await request(app)
    //     .post('/api/comments/create')
    //     .set('Authorization', 'Bearer token')
    //     .set('postid', mockPostId.toString())
    //     .send({ text: 'Test comment' });

    //   expect(response.status).toBe(200);
    //   expect(response.text).toBe('Comment created and linked to user and post');
    //   expect(mockComment.save).toHaveBeenCalled();
    //   expect(mockUser.save).toHaveBeenCalled();
    //   expect(mockPost.save).toHaveBeenCalled();
    // });
  });

  describe('GET /getcomments', () => {
    it('should get comments for a post', async () => {
      const mockComments = [{ text: 'Comment 1' }, { text: 'Comment 2' }];
      const mockPost = { comments: mockComments };

      (Post.findById as jest.Mock).mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockPost)
      });

      const response = await request(app)
        .get('/api/comments/getcomments')
        .set('postid', mockPostId.toString());

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockComments);
    });
  });

//   describe('PUT /editcomment', () => {
//     it('should edit a comment', async () => {
//       const mockComment = { 
//         _id: mockCommentId, 
//         text: 'Old text', 
//         save: jest.fn().mockResolvedValue(undefined)
//       };
  
//       (Comment.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockComment);
  
//       const response = await request(app)
//         .put('/api/comments/editcomment')
//         .set('Authorization', 'Bearer token')
//         .set('commentid', mockCommentId.toString())
//         .set('commentauthorid', mockUserId.toString())
//         .send({ text: 'Updated text' });
  
//       expect(Comment.findByIdAndUpdate).toHaveBeenCalledWith(
//         mockCommentId.toString(),
//         { text: 'Updated text' },
//         { new: true }
//       );
//       expect(response.status).toBe(200);
//       expect(response.text).toBe('Comment updated');
//       expect(mockComment.save).toHaveBeenCalled();
//     });
//   });

//   describe('DELETE /deletecomment', () => {
//     it('should delete a comment', async () => {
//       const mockDeletedComment = { _id: mockCommentId };
//       (Comment.findByIdAndDelete as jest.Mock).mockResolvedValue(mockDeletedComment);
  
//       const response = await request(app)
//         .delete('/api/comments/deletecomment')
//         .set('Authorization', 'Bearer token')
//         .set('commentid', mockCommentId.toString())
//         .set('commentauthorid', mockUserId.toString());
  
//       expect(Comment.findByIdAndDelete).toHaveBeenCalledWith(mockCommentId.toString());
//       expect(response.status).toBe(200);
//       expect(response.text).toBe('Comment deleted');
//     });
//   });

  describe('POST /:commentId/like', () => {
    it('should like a comment', async () => {
      const mockComment = {
        _id: mockCommentId,
        likes: 0,
        likedBy: [],
        dislikedBy: [],
        save: jest.fn()
      };

      (Comment.findById as jest.Mock).mockResolvedValue(mockComment);

      const response = await request(app)
        .post(`/api/comments/${mockCommentId}/like`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.likes).toBe(1);
      expect(response.body.likedBy).toContain(mockUserId.toString());
      expect(mockComment.save).toHaveBeenCalled();
    });
  });

  describe('POST /:commentId/unlike', () => {
    it('should unlike a comment', async () => {
      const mockComment = {
        _id: mockCommentId,
        likes: 1,
        likedBy: [mockUserId],
        dislikedBy: [],
        save: jest.fn()
      };

      (Comment.findById as jest.Mock).mockResolvedValue(mockComment);

      const response = await request(app)
        .post(`/api/comments/${mockCommentId}/unlike`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.likes).toBe(0);
      expect(response.body.dislikedBy).toContain(mockUserId.toString());
      expect(mockComment.save).toHaveBeenCalled();
    });
  });
});