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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const stellar_sdk_1 = require("stellar-sdk");
const user_1 = __importDefault(require("../models/user"));
const walletDetailsRoutes_1 = __importDefault(require("../routes/walletDetailsRoutes"));
const http_1 = __importDefault(require("http"));
jest.mock('stellar-sdk');
jest.mock('../models/user');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use('/api/wallet', walletDetailsRoutes_1.default);
const server = http_1.default.createServer(app);
describe('Wallet Details Route', () => {
    const mockUser = {
        _id: 'mockUserId',
        publicKey: 'mockPublicKey',
    };
    const mockAccount = {
        account_id: 'mockAccountId',
        balances: [{ asset_type: 'native', balance: '100' }],
    };
    beforeAll((done) => {
        server.listen(done);
    });
    afterAll((done) => {
        server.close(done);
    });
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return wallet details for authenticated user', () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock User.findById
        user_1.default.findById.mockResolvedValue(mockUser);
        // Mock Horizon Server loadAccount
        stellar_sdk_1.Horizon.Server.prototype.loadAccount.mockResolvedValue(mockAccount);
        // Create a valid JWT token
        const token = jsonwebtoken_1.default.sign({ user: { id: mockUser._id } }, 'my secret token');
        const response = yield (0, supertest_1.default)(app)
            .get('/api/wallet/details')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            balance: '100',
            publicKey: mockUser.publicKey,
            address: mockAccount.account_id,
        });
    }));
    it('should return 401 if no token is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get('/api/wallet/details');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ msg: 'Authorization denied' });
    }));
    it('should return 401 if an invalid token is provided', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .get('/api/wallet/details')
            .set('Authorization', 'Bearer invalidtoken');
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ msg: 'Invalid token' });
    }));
    it('should return 404 if user is not found', () => __awaiter(void 0, void 0, void 0, function* () {
        user_1.default.findById.mockResolvedValue(null);
        const token = jsonwebtoken_1.default.sign({ user: { id: 'nonexistentUserId' } }, 'my secret token');
        const response = yield (0, supertest_1.default)(app)
            .get('/api/wallet/details')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ msg: 'User not found' });
    }));
    it('should return 500 if there is a server error', () => __awaiter(void 0, void 0, void 0, function* () {
        user_1.default.findById.mockRejectedValue(new Error('Database error'));
        const token = jsonwebtoken_1.default.sign({ user: { id: mockUser._id } }, 'my secret token');
        const response = yield (0, supertest_1.default)(app)
            .get('/api/wallet/details')
            .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(500);
        expect(response.text).toBe('Server Error');
    }));
});
