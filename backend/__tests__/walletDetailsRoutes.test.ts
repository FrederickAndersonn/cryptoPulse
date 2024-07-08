import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { Horizon } from 'stellar-sdk';
import User from '../models/user';
import walletDetailsRoute from '../routes/walletDetailsRoutes';
import http from 'http';

jest.mock('stellar-sdk');
jest.mock('../models/user');

const app = express();
app.use(express.json());
app.use('/api/wallet', walletDetailsRoute);
const server = http.createServer(app);

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

  it('should return wallet details for authenticated user', async () => {
    // Mock User.findById
    (User.findById as jest.Mock).mockResolvedValue(mockUser);

    // Mock Horizon Server loadAccount
    (Horizon.Server.prototype.loadAccount as jest.Mock).mockResolvedValue(mockAccount);

    // Create a valid JWT token
    const token = jwt.sign({ user: { id: mockUser._id } }, 'my secret token');

    const response = await request(app)
      .get('/api/wallet/details')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      balance: '100',
      publicKey: mockUser.publicKey,
      address: mockAccount.account_id,
    });
  });

  it('should return 401 if no token is provided', async () => {
    const response = await request(app).get('/api/wallet/details');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ msg: 'Authorization denied' });
  });

  it('should return 401 if an invalid token is provided', async () => {
    const response = await request(app)
      .get('/api/wallet/details')
      .set('Authorization', 'Bearer invalidtoken');

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ msg: 'Invalid token' });
  });

  it('should return 404 if user is not found', async () => {
    (User.findById as jest.Mock).mockResolvedValue(null);

    const token = jwt.sign({ user: { id: 'nonexistentUserId' } }, 'my secret token');

    const response = await request(app)
      .get('/api/wallet/details')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ msg: 'User not found' });
  });

  it('should return 500 if there is a server error', async () => {
    (User.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

    const token = jwt.sign({ user: { id: mockUser._id } }, 'my secret token');

    const response = await request(app)
      .get('/api/wallet/details')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(500);
    expect(response.text).toBe('Server Error');
  });
});