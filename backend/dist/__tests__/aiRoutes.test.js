"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
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
        expect(express_1.Router).toHaveBeenCalled();
        expect(mockGet).toHaveBeenCalledWith('/predict', aiController_1.predict);
    });
});
