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
const server_1 = require("../server"); // Import the Express app and server
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mongoose_1 = __importDefault(require("mongoose"));
// Mock User model
jest.mock('../models/user');
const mockedUser = user_1.default;
// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcryptjs_1.default;
// Mock jwt
jest.mock('jsonwebtoken');
const mockedJwt = jsonwebtoken_1.default;
describe('POST /login', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });
    afterAll((done) => {
        server_1.server.close(done); // Close server after all tests
    });
    it('should return a token and user id if credentials are valid', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'test@example.com';
        const password = 'password123';
        // Create a valid UserDocument object
        const user = new user_1.default({
            _id: new mongoose_1.default.Types.ObjectId(),
            id: 'user123',
            name: 'Test User',
            email,
            password: 'hashedpassword',
            publicKey: '',
            secretKey: '',
            initialBalance: 0,
            comments: [],
            posts: [],
            transactions: [],
            watchlist: [],
        });
        // Mock User.findOne
        mockedUser.findOne.mockResolvedValue(user);
        // Mock bcrypt.compare
        mockedBcrypt.compare.mockResolvedValue(true);
        // Mock jwt.sign
        const token = 'mockedToken';
        mockedJwt.sign.mockImplementation((payload, secret, options, callback) => {
            callback(null, token);
        });
        const res = yield (0, supertest_1.default)(server_1.app)
            .post('/login')
            .send({ email, password });
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ token, userid: user.id });
        expect(mockedUser.findOne).toHaveBeenCalledWith({ email });
        expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, user.password);
        expect(mockedJwt.sign).toHaveBeenCalledWith({ user: { id: user.id } }, expect.any(String), { expiresIn: 360000 }, expect.any(Function));
    }));
    it('should return 400 if credentials are invalid', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'test@example.com';
        const password = 'password123';
        // Mock User.findOne
        mockedUser.findOne.mockResolvedValue(null);
        const res = yield (0, supertest_1.default)(server_1.app)
            .post('/login')
            .send({ email, password });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Invalid credentials');
    }));
    it('should return 500 if there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
        const email = 'test@example.com';
        const password = 'password123';
        // Mock User.findOne to throw an error
        mockedUser.findOne.mockRejectedValue(new Error('Server error'));
        const res = yield (0, supertest_1.default)(server_1.app)
            .post('/login')
            .send({ email, password });
        expect(res.status).toBe(500);
        expect(res.text).toBe('Server Error');
    }));
});
