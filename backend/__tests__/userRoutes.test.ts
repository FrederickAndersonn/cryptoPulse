import request from 'supertest';
import { app, server } from '../server';
import User, { UserDocument } from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { encrypt } from '../utils/encryption';
import mongoose from 'mongoose';

// Mock User model
jest.mock('../models/user');
const mockedUser = User as jest.Mocked<typeof User>;

// Mock bcrypt
jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

// Mock jwt
jest.mock('jsonwebtoken');
const mockedJwt = jwt as jest.Mocked<typeof jwt>;

// Mock encrypt function
jest.mock('../utils/encryption');
const mockedEncrypt = encrypt as jest.MockedFunction<typeof encrypt>;

// Mock fetch
global.fetch = jest.fn();

jest.mock('stellar-sdk', () => {
  const originalModule = jest.requireActual('stellar-sdk');
  return {
    ...originalModule,
    Keypair: {
      random: jest.fn().mockReturnValue({
        publicKey: jest.fn().mockReturnValue('GCOA3Q5VE7Z5ZJ4SDGFRM7PZT5M4VV7BR3HE2GIPTBV7VBGUZ6HZDBWK'),
        secret: jest.fn().mockReturnValue('SC3M7AQJSPYKJZTMXATWX2VDNQ2BCNPVST2OM6Q7DUU5JS32ZVJZIAZQ')
      })
    }
  };
});

describe('POST /register', () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear mocks after each test
  });

  afterAll(async () => {
    await mongoose.connection.close(); // Close Mongoose connection
    server.close(); // Close server after all tests
  });

  it('should register a new user and return a token', async () => {
    const name = 'Test User';
    const email = 'test@example.com';
    const password = 'password123';
  
    // Mock User.findOne to return null (user does not exist)
    mockedUser.findOne.mockResolvedValue(null);
  
    // Mock fetch for Stellar account funding
    (global.fetch as jest.Mock).mockResolvedValue({
      json: jest.fn().mockResolvedValue({}),
    } as unknown as Response);
  
    // Mock bcrypt functions with correct type annotations
    mockedBcrypt.genSalt.mockResolvedValue('salt' as never);
    mockedBcrypt.hash.mockResolvedValue('hashedpassword' as never);
  
    // Mock encrypt function
    mockedEncrypt.mockReturnValue('encryptedSecretKey');
  
    // Mock jwt.sign
    const token = 'mockedToken';
    mockedJwt.sign.mockImplementation((payload, secret, options, callback) => {
      callback(null, token);
    });
  
    // Create a valid UserDocument object
    const user: UserDocument = new User({
      _id: new mongoose.Types.ObjectId(),
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
    mockedUser.create.mockResolvedValue(user as never);
  
    const res = await request(app)
      .post('/register')
      .send({ name, email, password });
  
    // Assert the status code is 200 for a successful registration
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      token,
      userid: user._id,
    });
    expect(mockedUser.findOne).toHaveBeenCalledWith({ email });
    expect(global.fetch).toHaveBeenCalledWith(
      `https://friendbot.stellar.org?addr=${encodeURIComponent('GCOA3Q5VE7Z5ZJ4SDGFRM7PZT5M4VV7BR3HE2GIPTBV7VBGUZ6HZDBWK')}`
    );
    expect(mockedBcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 'salt');
    expect(mockedEncrypt).toHaveBeenCalledWith('SC3M7AQJSPYKJZTMXATWX2VDNQ2BCNPVST2OM6Q7DUU5JS32ZVJZIAZQ');
    expect(mockedJwt.sign).toHaveBeenCalledWith(
      { user: { id: user._id } },
      expect.any(String),
      { expiresIn: 360000 },
      expect.any(Function)
    );
  });
  
  

  it('should return 400 if user already exists', async () => {
    const name = 'Test User';
    const email = 'test@example.com';
    const password = 'password123';

    // Mock User.findOne to return an existing user
    mockedUser.findOne.mockResolvedValue({
      email,
    } as UserDocument);

    const res = await request(app)
      .post('/register')
      .send({ name, email, password });

    expect(res.status).toBe(400);
    expect(res.body.errors[0].msg).toBe('User already exists');
    expect(mockedUser.findOne).toHaveBeenCalledWith({ email });
  });

  it('should return 500 if there is a server error', async () => {
    const name = 'Test User';
    const email = 'test@example.com';
    const password = 'password123';

    // Mock User.findOne to throw an error
    mockedUser.findOne.mockRejectedValue(new Error('Server error'));

    const res = await request(app)
      .post('/register')
      .send({ name, email, password });

    expect(res.status).toBe(500);
    expect(res.text).toBe('Server Error');
  });
});
