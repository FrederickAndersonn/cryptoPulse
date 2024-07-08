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
const server_1 = require("../server");
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const encryption_1 = require("../utils/encryption");
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
// Mock encrypt function
jest.mock('../utils/encryption');
const mockedEncrypt = encryption_1.encrypt;
// Mock fetch
global.fetch = jest.fn();
jest.mock('stellar-sdk', () => {
    const originalModule = jest.requireActual('stellar-sdk');
    return Object.assign(Object.assign({}, originalModule), { Keypair: {
            random: jest.fn().mockReturnValue({
                publicKey: jest.fn().mockReturnValue('GCOA3Q5VE7Z5ZJ4SDGFRM7PZT5M4VV7BR3HE2GIPTBV7VBGUZ6HZDBWK'),
                secret: jest.fn().mockReturnValue('SC3M7AQJSPYKJZTMXATWX2VDNQ2BCNPVST2OM6Q7DUU5JS32ZVJZIAZQ')
            })
        } });
});
describe('POST /register', () => {
    afterEach(() => {
        jest.clearAllMocks(); // Clear mocks after each test
    });
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield mongoose_1.default.connection.close(); // Close Mongoose connection
        server_1.server.close(); // Close server after all tests
    }));
    it('should register a new user and return a token', () => __awaiter(void 0, void 0, void 0, function* () {
        const name = 'Test User';
        const email = 'test@example.com';
        const password = 'password123';
        // Mock User.findOne to return null (user does not exist)
        mockedUser.findOne.mockResolvedValue(null);
        // Mock fetch for Stellar account funding
        global.fetch.mockResolvedValue({
            json: jest.fn().mockResolvedValue({}),
        });
        // Mock bcrypt functions with correct type annotations
        mockedBcrypt.genSalt.mockResolvedValue('salt');
        mockedBcrypt.hash.mockResolvedValue('hashedpassword');
        // Mock encrypt function
        mockedEncrypt.mockReturnValue('encryptedSecretKey');
        // Mock jwt.sign
        const token = 'mockedToken';
        mockedJwt.sign.mockImplementation((payload, secret, options, callback) => {
            callback(null, token);
        });
        // Create a valid UserDocument object
        const user = new user_1.default({
            _id: new mongoose_1.default.Types.ObjectId(),
            name: 'Test User',
            email,
            password: 'hashedpassword',
            publicKey: 'GCOA3Q5VE7Z5ZJ4SDGFRM7PZT5M4VV7BR3HE2GIPTBV7VBGUZ6HZDBWK',
            secretKey: 'encryptedSecretKey',
            initialBalance: 0,
            comments: [],
            posts: [],
            transactions: [],
            watchlist: [],
        });
        // Mock User.create
        mockedUser.create.mockResolvedValue(user);
        const res = yield (0, supertest_1.default)(server_1.app)
            .post('/register')
            .send({ name, email, password });
        // Assert the status code is 200 for a successful registration
        expect(res.status).toBe(200);
        expect(res.body).toEqual({
            token,
            userid: user._id,
        });
        expect(mockedUser.findOne).toHaveBeenCalledWith({ email });
        expect(global.fetch).toHaveBeenCalledWith(`https://friendbot.stellar.org?addr=${encodeURIComponent('GCOA3Q5VE7Z5ZJ4SDGFRM7PZT5M4VV7BR3HE2GIPTBV7VBGUZ6HZDBWK')}`);
        expect(mockedBcrypt.genSalt).toHaveBeenCalledWith(10);
        expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 'salt');
        expect(mockedEncrypt).toHaveBeenCalledWith('SC3M7AQJSPYKJZTMXATWX2VDNQ2BCNPVST2OM6Q7DUU5JS32ZVJZIAZQ');
        expect(mockedJwt.sign).toHaveBeenCalledWith({ user: { id: user._id } }, expect.any(String), { expiresIn: 360000 }, expect.any(Function));
    }));
    it('should return 400 if user already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        const name = 'Test User';
        const email = 'test@example.com';
        const password = 'password123';
        // Mock User.findOne to return an existing user
        mockedUser.findOne.mockResolvedValue({
            email,
        });
        const res = yield (0, supertest_1.default)(server_1.app)
            .post('/register')
            .send({ name, email, password });
        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('User already exists');
        expect(mockedUser.findOne).toHaveBeenCalledWith({ email });
    }));
    it('should return 500 if there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
        const name = 'Test User';
        const email = 'test@example.com';
        const password = 'password123';
        // Mock User.findOne to throw an error
        mockedUser.findOne.mockRejectedValue(new Error('Server error'));
        const res = yield (0, supertest_1.default)(server_1.app)
            .post('/register')
            .send({ name, email, password });
        expect(res.status).toBe(500);
        expect(res.text).toBe('Server Error');
    }));
});
