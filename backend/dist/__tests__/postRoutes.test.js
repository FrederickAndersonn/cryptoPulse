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
const postRoutes_1 = __importDefault(require("../routes/postRoutes"));
const user_1 = __importDefault(require("../models/user"));
const post_1 = __importDefault(require("../models/post"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api', postRoutes_1.default);
jest.mock('../models/user');
jest.mock('../models/post');
jest.mock('jsonwebtoken');
describe('Post Routes', () => {
    const mockUserId = new mongoose_1.default.Types.ObjectId().toString();
    const mockPostId = new mongoose_1.default.Types.ObjectId().toString();
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /api/posts', () => {
        it('should return all posts', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockPosts = [{ id: mockPostId, title: 'Test Post' }];
            post_1.default.find.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockPosts),
            });
            const res = yield (0, supertest_1.default)(app).get('/api/posts');
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPosts);
        }));
    });
    describe('GET /api/users/:userId/posts', () => {
        it('should return all posts by a user', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUserPosts = [{ id: mockPostId, title: 'User Post' }];
            post_1.default.find.mockResolvedValue(mockUserPosts);
            const res = yield (0, supertest_1.default)(app).get(`/api/users/${mockUserId}/posts`);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUserPosts);
        }));
    });
    describe('GET /api/posts/:id', () => {
        it('should return a single post', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockPost = { id: mockPostId, title: 'Single Post' };
            post_1.default.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockPost),
                }),
            });
            const res = yield (0, supertest_1.default)(app).get(`/api/posts/${mockPostId}`);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockPost);
        }));
    });
    describe('PUT /api/posts/:id', () => {
        it('should update a post', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockToken = 'mock-token';
            const mockUpdatedPost = { id: mockPostId, title: 'Updated Post' };
            jsonwebtoken_1.default.verify.mockReturnValue({ user: { id: mockUserId } });
            post_1.default.findById.mockResolvedValue({ author: { id: mockUserId } });
            post_1.default.findByIdAndUpdate.mockResolvedValue(mockUpdatedPost);
            const res = yield (0, supertest_1.default)(app)
                .put(`/api/posts/${mockPostId}`)
                .set('Authorization', `Bearer ${mockToken}`)
                .send(mockUpdatedPost);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockUpdatedPost);
        }));
    });
    describe('DELETE /api/posts/:id', () => {
        it('should delete a post', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockToken = 'mock-token';
            jsonwebtoken_1.default.verify.mockReturnValue({ user: { id: mockUserId } });
            post_1.default.findById.mockResolvedValue({ author: { id: mockUserId } });
            post_1.default.findByIdAndDelete.mockResolvedValue({});
            user_1.default.findByIdAndUpdate.mockResolvedValue({});
            const res = yield (0, supertest_1.default)(app)
                .delete(`/api/posts/${mockPostId}`)
                .set('Authorization', `Bearer ${mockToken}`);
            expect(res.status).toBe(200);
            expect(res.body).toEqual({ message: 'Post deleted successfully' });
        }));
    });
    describe('POST /api/posts/:postId/vote', () => {
        it('should upvote a post', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockToken = 'mock-token';
            const mockPost = {
                id: mockPostId,
                votes: 0,
                votedBy: [],
                save: jest.fn(),
            };
            jsonwebtoken_1.default.verify.mockReturnValue({ user: { id: mockUserId } });
            post_1.default.findById.mockResolvedValue(mockPost);
            const res = yield (0, supertest_1.default)(app)
                .post(`/api/posts/${mockPostId}/vote`)
                .set('Authorization', `Bearer ${mockToken}`)
                .send({ vote: 1 });
            expect(res.status).toBe(200);
            expect(mockPost.votes).toBe(1);
            expect(mockPost.votedBy.length).toBe(1);
            expect(mockPost.save).toHaveBeenCalled();
        }));
    });
});
