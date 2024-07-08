import { Router } from 'express';
import { predict } from '../controllers/aiController';

// Mock the express Router
const mockGet = jest.fn();
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    get: mockGet,
  })),
}));

// Mock the aiController
jest.mock('../controllers/aiController', () => ({
  predict: jest.fn(),
}));

describe('AI Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should set up GET /predict route', () => {
    // Act
    // We need to import the router here to execute the code
    require('../routes/aiRoutes');

    // Assert
    expect(Router).toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledWith('/predict', predict);
  });
});