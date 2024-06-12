import request from 'supertest';
import { app, server } from '../server'; 
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

jest.mock('../models/user');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

afterAll(async () => {
  server.close(); // Close the server after all tests
  jest.restoreAllMocks();
});

afterEach(async () => {
  jest.clearAllMocks();
  await User.deleteMany();
});

describe('POST /login', () => {
  it('should login successfully with correct credentials', async () => {
    const mockUser = {
      id: 'mockUserId',
      email: 'johndoe@example.com',
      password: 'mockHashedPassword',
    };

    (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(true);
    (jwt.sign as jest.Mock).mockImplementationOnce((payload, secret, options, callback) => {
      callback(null, 'mockToken');
    });

    const response = await request(app)
      .post('/login')
      .send({
        email: 'johndoe@example.com',
        password: 'password123'
      })
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('token', 'mockToken');
    expect(response.body).toHaveProperty('userid', 'mockUserId');
    expect(User.findOne).toHaveBeenCalledWith({ email: 'johndoe@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'mockHashedPassword');
    expect(jwt.sign).toHaveBeenCalledWith(
      { user: { id: 'mockUserId' } },
      'my secret token',
      { expiresIn: 360000 },
      expect.any(Function)
    );
  });

  it('should return an error if the email does not exist', async () => {
    (User.findOne as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app)
      .post('/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Invalid credentials'
        })
      ])
    );
    expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
  });

  it('should return an error if the password is incorrect', async () => {
    const mockUser = {
      id: 'mockUserId',
      email: 'johndoe@example.com',
      password: 'mockHashedPassword',
    };

    (User.findOne as jest.Mock).mockResolvedValueOnce(mockUser);
    (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

    const response = await request(app)
      .post('/login')
      .send({
        email: 'johndoe@example.com',
        password: 'wrongpassword'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Invalid Credentials'
        })
      ])
    );
    expect(User.findOne).toHaveBeenCalledWith({ email: 'johndoe@example.com' });
    expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'mockHashedPassword');
  });

  it('should return an error if the fields are missing', async () => {
    const response = await request(app)
      .post('/login')
      .send({
        email: ''
      })
      .expect('Content-Type', /json/)
      .expect(400);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Password is required'
        })
      ])
    );
  });
});
