import request from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/user';
import auth from '../middleware/auth';
import userDetailsRoutes from '../routes/userDetailsRoutes';
import http from 'http';

jest.mock('../models/user', () => ({
    findById: jest.fn(),
  }));
jest.mock('../middleware/auth', () => (
    jest.fn((req, res, next) => next())
  ));
jest.mock('bcryptjs');

const app = express();
app.use(express.json());
app.use('/api/users', userDetailsRoutes);
const server = http.createServer(app);

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
    it('should return user profile', async () => {
        const mockUser = { 
          _id: 'user123', 
          name: 'Test User', 
          email: 'test@example.com',
        };
        const mockSelect = jest.fn().mockResolvedValue(mockUser);
        (User.findById as jest.Mock).mockReturnValue({ select: mockSelect });
        (auth as jest.Mock).mockImplementation((req, res, next) => {
          req.user = { id: 'user123' };
          next();
        });
      
        const response = await request(server).get('/api/users/profile');
      
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockUser);
        expect(mockSelect).toHaveBeenCalledWith('-password -secretKey');
      });
  
    it('should return 404 if user not found', async () => {
      (User.findById as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });
      (auth as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 'user123' };
        next();
      });
  
      const response = await request(app).get('/api/users/profile');
  
      expect(response.status).toBe(404);
      expect(response.body).toEqual({ msg: 'User not found' });
    });
  });

  describe('PUT /api/users/update-password', () => {
    it('should update password successfully', async () => {
      const mockUser = { 
        _id: 'user123', 
        password: 'oldHashedPassword',
        save: jest.fn().mockResolvedValue(true)
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (auth as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 'user123' };
        next();
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHashedPassword');

      const response = await request(app)
        .put('/api/users/update-password')
        .send({ currentPassword: 'oldPassword', newPassword: 'newPassword' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ msg: 'Password updated successfully' });
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 400 if current password is incorrect', async () => {
      const mockUser = { _id: 'user123', password: 'oldHashedPassword' };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (auth as jest.Mock).mockImplementation((req, res, next) => {
        req.user = { id: 'user123' };
        next();
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const response = await request(app)
        .put('/api/users/update-password')
        .send({ currentPassword: 'wrongPassword', newPassword: 'newPassword' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ msg: 'Incorrect current password' });
    });
  });

  describe('PUT /api/users/:id/watchlist', () => {
    it('should add coin to watchlist', async () => {
      const mockUser = { 
        _id: 'user123', 
        watchlist: ['coin1'],
        save: jest.fn().mockResolvedValue(true)
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (auth as jest.Mock).mockImplementation((req, res, next) => next());

      const response = await request(app)
        .put('/api/users/user123/watchlist')
        .send({ coinId: 'coin2' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(['coin1', 'coin2']);
      expect(mockUser.save).toHaveBeenCalled();
    });

    it('should return 400 if coin already in watchlist', async () => {
      const mockUser = { 
        _id: 'user123', 
        watchlist: ['coin1'],
        save: jest.fn().mockResolvedValue(true)
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (auth as jest.Mock).mockImplementation((req, res, next) => next());

      const response = await request(app)
        .put('/api/users/user123/watchlist')
        .send({ coinId: 'coin1' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ msg: 'Coin already in watchlist' });
    });
  });

  describe('GET /api/users/:id/watchlist', () => {
    it('should return user watchlist', async () => {
      const mockUser = { _id: 'user123', watchlist: ['coin1', 'coin2'] };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (auth as jest.Mock).mockImplementation((req, res, next) => next());

      const response = await request(app).get('/api/users/user123/watchlist');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(['coin1', 'coin2']);
    });
  });

  describe('DELETE /api/users/:id/watchlist/:coinId', () => {
    it('should remove coin from watchlist', async () => {
      const mockUser = { 
        _id: 'user123', 
        watchlist: ['coin1', 'coin2'],
        save: jest.fn().mockResolvedValue(true)
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      (auth as jest.Mock).mockImplementation((req, res, next) => next());

      const response = await request(app).delete('/api/users/user123/watchlist/coin1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(['coin2']);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });
});