import request from 'supertest';
import { app, server } from '../server'; // Import the server to close it later
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

jest.mock('../models/user');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

afterAll(async () => {
  jest.restoreAllMocks();
  await mongoose.connection.close();
  server.close(() => {
    console.log('Server closed');
  });
});

afterEach(async () => {
  jest.clearAllMocks();
});

describe('POST /register', () => {
  it('should register a new user', async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockUserSave = jest.fn().mockResolvedValueOnce({
      _id: mockUserId,
      id: mockUserId.toString()
    });
    
    // Mock User model to return a new user instance with a save method
    (User as any).mockImplementationOnce(() => ({
      save: mockUserSave,
      _id: mockUserId,
      id: mockUserId.toString()
    }));

    // Mock User.findOne to return null (indicating that the user does not already exist)
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);
    
    // Mock bcrypt functions
    (bcrypt.genSalt as jest.Mock).mockResolvedValueOnce('mockSalt');
    (bcrypt.hash as jest.Mock).mockResolvedValueOnce('mockHashedPassword');
    
    // Mock jwt.sign function
    (jwt.sign as jest.Mock).mockImplementationOnce((payload, secret, options, callback) => {
      callback(null, 'mockToken');
    });

    const response = await request(app)
      .post('/register')
      .send({
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123'
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('token', 'mockToken');
    expect(response.body).toHaveProperty('userid', mockUserId.toString());
    expect(User.findOne).toHaveBeenCalledWith({ email: 'johndoe@example.com' });
    expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'mockSalt');
    expect(mockUserSave).toHaveBeenCalled();
    expect(jwt.sign).toHaveBeenCalledWith(
      { user: { id: mockUserId.toString() } },
      'my secret token',
      { expiresIn: 360000 },
      expect.any(Function)
    );
  });

  it('should return an error if the email already exists', async () => {
    // Mock User.findOne to return an existing user (indicating that the user already exists)
    (User.findOne as jest.Mock).mockResolvedValueOnce({
      id: 'existingUserId',
      email: 'existing@example.com'
    });

    const response = await request(app)
      .post('/register')
      .send({
        name: 'New User',
        email: 'existing@example.com',
        password: 'password123'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'User already exists'
        })
      ])
    );
    expect(User.findOne).toHaveBeenCalledWith({ email: 'existing@example.com' });
  });
});
