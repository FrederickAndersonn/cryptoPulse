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
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const user_1 = __importDefault(require("../models/user"));
const auth_1 = __importDefault(require("../middleware/auth"));
const userDetailsRoutes_1 = __importDefault(require("../routes/userDetailsRoutes"));
const http_1 = __importDefault(require("http"));
jest.mock('../models/user', () => ({
    findById: jest.fn(),
}));
jest.mock('../middleware/auth', () => (jest.fn((req, res, next) => next())));
jest.mock('bcryptjs');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/users', userDetailsRoutes_1.default);
const server = http_1.default.createServer(app);
describe('User Details Routes', () => {
    beforeAll((done) => {
        server.listen(done);
    });
    afterAll((done) => {
        server.close(done);
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('GET /api/users/profile', () => {
        it('should return user profile', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                _id: 'user123',
                name: 'Test User',
                email: 'test@example.com',
            };
            const mockSelect = jest.fn().mockResolvedValue(mockUser);
            user_1.default.findById.mockReturnValue({ select: mockSelect });
            auth_1.default.mockImplementation((req, res, next) => {
                req.user = { id: 'user123' };
                next();
            });
            const response = yield (0, supertest_1.default)(server).get('/api/users/profile');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockUser);
            expect(mockSelect).toHaveBeenCalledWith('-password -secretKey');
        }));
        it('should return 404 if user not found', () => __awaiter(void 0, void 0, void 0, function* () {
            user_1.default.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });
            auth_1.default.mockImplementation((req, res, next) => {
                req.user = { id: 'user123' };
                next();
            });
            const response = yield (0, supertest_1.default)(app).get('/api/users/profile');
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ msg: 'User not found' });
        }));
    });
    describe('PUT /api/users/update-password', () => {
        it('should update password successfully', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                _id: 'user123',
                password: 'oldHashedPassword',
                save: jest.fn().mockResolvedValue(true)
            };
            user_1.default.findById.mockResolvedValue(mockUser);
            auth_1.default.mockImplementation((req, res, next) => {
                req.user = { id: 'user123' };
                next();
            });
            bcryptjs_1.default.compare.mockResolvedValue(true);
            bcryptjs_1.default.genSalt.mockResolvedValue('salt');
            bcryptjs_1.default.hash.mockResolvedValue('newHashedPassword');
            const response = yield (0, supertest_1.default)(app)
                .put('/api/users/update-password')
                .send({ currentPassword: 'oldPassword', newPassword: 'newPassword' });
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ msg: 'Password updated successfully' });
            expect(mockUser.save).toHaveBeenCalled();
        }));
        it('should return 400 if current password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = { _id: 'user123', password: 'oldHashedPassword' };
            user_1.default.findById.mockResolvedValue(mockUser);
            auth_1.default.mockImplementation((req, res, next) => {
                req.user = { id: 'user123' };
                next();
            });
            bcryptjs_1.default.compare.mockResolvedValue(false);
            const response = yield (0, supertest_1.default)(app)
                .put('/api/users/update-password')
                .send({ currentPassword: 'wrongPassword', newPassword: 'newPassword' });
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ msg: 'Incorrect current password' });
        }));
    });
    describe('PUT /api/users/:id/watchlist', () => {
        it('should add coin to watchlist', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                _id: 'user123',
                watchlist: ['coin1'],
                save: jest.fn().mockResolvedValue(true)
            };
            user_1.default.findById.mockResolvedValue(mockUser);
            auth_1.default.mockImplementation((req, res, next) => next());
            const response = yield (0, supertest_1.default)(app)
                .put('/api/users/user123/watchlist')
                .send({ coinId: 'coin2' });
            expect(response.status).toBe(200);
            expect(response.body).toEqual(['coin1', 'coin2']);
            expect(mockUser.save).toHaveBeenCalled();
        }));
        it('should return 400 if coin already in watchlist', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                _id: 'user123',
                watchlist: ['coin1'],
                save: jest.fn().mockResolvedValue(true)
            };
            user_1.default.findById.mockResolvedValue(mockUser);
            auth_1.default.mockImplementation((req, res, next) => next());
            const response = yield (0, supertest_1.default)(app)
                .put('/api/users/user123/watchlist')
                .send({ coinId: 'coin1' });
            expect(response.status).toBe(400);
            expect(response.body).toEqual({ msg: 'Coin already in watchlist' });
        }));
    });
    describe('GET /api/users/:id/watchlist', () => {
        it('should return user watchlist', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = { _id: 'user123', watchlist: ['coin1', 'coin2'] };
            user_1.default.findById.mockResolvedValue(mockUser);
            auth_1.default.mockImplementation((req, res, next) => next());
            const response = yield (0, supertest_1.default)(app).get('/api/users/user123/watchlist');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(['coin1', 'coin2']);
        }));
    });
    describe('DELETE /api/users/:id/watchlist/:coinId', () => {
        it('should remove coin from watchlist', () => __awaiter(void 0, void 0, void 0, function* () {
            const mockUser = {
                _id: 'user123',
                watchlist: ['coin1', 'coin2'],
                save: jest.fn().mockResolvedValue(true)
            };
            user_1.default.findById.mockResolvedValue(mockUser);
            auth_1.default.mockImplementation((req, res, next) => next());
            const response = yield (0, supertest_1.default)(app).delete('/api/users/user123/watchlist/coin1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(['coin2']);
            expect(mockUser.save).toHaveBeenCalled();
        }));
    });
});
