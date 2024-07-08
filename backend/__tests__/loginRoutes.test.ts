import request from 'supertest';
import express from 'express';
import User, { UserDocument } from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import loginRouter from '../routes/loginRoutes';

// Mock User model
jest.mock('../models/user');
const mockedUser = User as jest.Mocked<typeof User>;

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock jwt
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// Create a mock Express app
const app = express();
app.use(express.json());
app.use('/login', loginRouter);

describe('POST /login', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  it('should return a token and user id if credentials are valid', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    // Create a valid UserDocument object
    const user: UserDocument = new User({
      _id: new mongoose.Types.ObjectId(),
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
    mockedBcrypt.compare.mockResolvedValue(true as never);

    // Mock jwt.sign
    const token = 'mockedToken';
    mockedJwt.sign.mockImplementation((_payload, _secret, _options, callback) => {
      callback(null, token);
    });

    const res = await request(app)
      .post('/login')
      .send({ email, password });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ token, userid: user.id });
    expect(mockedUser.findOne).toHaveBeenCalledWith({ email });
    expect(mockedBcrypt.compare).toHaveBeenCalledWith(password, user.password);
    expect(mockedJwt.sign).toHaveBeenCalledWith(
      { user: { id: user.id } },
      "my secret token",
      { expiresIn: 360000 },
      expect.any(Function)
    );
  });

  it('should return 400 if credentials are invalid', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    // Mock User.findOne
    mockedUser.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/login')
      .send({ email, password });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toBe('Invalid credentials');
  });

  it('should return 500 if there is a server error', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    // Mock User.findOne to throw an error
    mockedUser.findOne.mockRejectedValue(new Error('Server error'));

    const res = await request(app)
      .post('/login')
      .send({ email, password });

    expect(res.status).toBe(500);
    expect(res.text).toBe('Server Error');
  });
});