"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supertest_1 = __importDefault(require("supertest"));
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const commentRoutes_1 = __importDefault(require("../routes/commentRoutes"));
const comment_1 = __importDefault(require("../models/comment"));
const post_1 = __importDefault(require("../models/post"));
// Mock the models
jest.mock('../models/user');
jest.mock('../models/comment');
jest.mock('../models/post');
// Mock jwt
jest.mock('jsonwebtoken');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/comments', commentRoutes_1.default);
describe('Comment Routes', () => {
    const mockUserId = new mongoose_1.default.Types.ObjectId();
    const mockPostId = new mongoose_1.default.Types.ObjectId();
    const mockCommentId = new mongoose_1.default.Types.ObjectId();
    beforeEach(() => {
        jest.clearAllMocks();
        jsonwebtoken_1.default.verify.mockReturnValue({ user: { id: mockUserId.toString() } });
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
        it('should get comments for a post', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockComments = [{ text: 'Comment 1' }, { text: 'Comment 2' }];
            const mockPost = { comments: mockComments };
            post_1.default.findById.mockReturnValue({
                populate: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValue(mockPost)
            });
            const response = yield (0, supertest_1.default)(app)
                .get('/api/comments/getcomments')
                .set('postid', mockPostId.toString());
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockComments);
        }));
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
        it('should like a comment', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockComment = {
                _id: mockCommentId,
                likes: 0,
                likedBy: [],
                dislikedBy: [],
                save: jest.fn()
            };
            comment_1.default.findById.mockResolvedValue(mockComment);
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/comments/${mockCommentId}/like`)
                .set('Authorization', 'Bearer token');
            expect(response.status).toBe(200);
            expect(response.body.likes).toBe(1);
            expect(response.body.likedBy).toContain(mockUserId.toString());
            expect(mockComment.save).toHaveBeenCalled();
        }));
    });
    describe('POST /:commentId/unlike', () => {
        it('should unlike a comment', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockComment = {
                _id: mockCommentId,
                likes: 1,
                likedBy: [mockUserId],
                dislikedBy: [],
                save: jest.fn()
            };
            comment_1.default.findById.mockResolvedValue(mockComment);
            const response = yield (0, supertest_1.default)(app)
                .post(`/api/comments/${mockCommentId}/unlike`)
                .set('Authorization', 'Bearer token');
            expect(response.status).toBe(200);
            expect(response.body.likes).toBe(0);
            expect(response.body.dislikedBy).toContain(mockUserId.toString());
            expect(mockComment.save).toHaveBeenCalled();
        }));
    });
});
