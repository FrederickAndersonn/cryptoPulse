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
const serverTest_1 = require("../serverTest"); // Use the test server
const user_1 = __importDefault(require("../models/user"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const mongoose_1 = __importDefault(require("mongoose"));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield serverTest_1.server.close();
    yield mongoose_1.default.connection.close(); // Close the connection to the test database
}));
afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
    yield user_1.default.deleteMany(); // Clear the users collection after each test
}));
describe('POST /register', () => {
    it('should register a new user', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.setTimeout(10000); // Set timeout to 10 seconds
        console.log("Starting test: should register a new user");
        const response = yield (0, supertest_1.default)(serverTest_1.app)
            .post('/register')
            .send({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password: 'password123'
        })
            .expect('Content-Type', /json/)
            .expect(200);
        console.log("Response received", response.body);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('userid');
        const user = yield user_1.default.findOne({ email: 'johndoe@example.com' });
        expect(user).not.toBeNull();
        if (user) {
            expect(user.name).toBe('John Doe');
        }
    }), 10000); // Set timeout to 10 seconds
    it('should return an error if the email already exists', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.setTimeout(10000); // Set timeout to 10 seconds
        console.log("Starting test: should return an error if the email already exists");
        yield user_1.default.create({
            name: 'Existing User',
            email: 'existing@example.com',
            password: yield bcryptjs_1.default.hash('password123', 10),
        });
        const response = yield (0, supertest_1.default)(serverTest_1.app)
            .post('/register')
            .send({
            name: 'New User',
            email: 'existing@example.com',
            password: 'password123'
        })
            .expect('Content-Type', /json/)
            .expect(400);
        console.log("Response received", response.body);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'User already exists'
            })
        ]));
    }), 10000); // Set timeout to 10 seconds
});
describe('POST /login', () => {
    it('should login successfully with correct credentials', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.setTimeout(10000); // Set timeout to 10 seconds
        console.log("Starting test: should login successfully with correct credentials");
        const password = yield bcryptjs_1.default.hash('password123', 10);
        yield user_1.default.create({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password,
        });
        const response = yield (0, supertest_1.default)(serverTest_1.app)
            .post('/login')
            .send({
            email: 'johndoe@example.com',
            password: 'password123'
        })
            .expect('Content-Type', /json/)
            .expect(200);
        console.log("Response received", response.body);
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('userid');
    }), 20000); // Set timeout to 10 seconds
    it('should return an error if the email does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.setTimeout(10000); // Set timeout to 10 seconds
        console.log("Starting test: should return an error if the email does not exist");
        const response = yield (0, supertest_1.default)(serverTest_1.app)
            .post('/login')
            .send({
            email: 'nonexistent@example.com',
            password: 'password123'
        })
            .expect('Content-Type', /json/)
            .expect(400);
        console.log("Response received", response.body);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Invalid credentials'
            })
        ]));
    }), 20000); // Set timeout to 10 seconds
    it('should return an error if the password is incorrect', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.setTimeout(10000); // Set timeout to 10 seconds
        console.log("Starting test: should return an error if the password is incorrect");
        const password = yield bcryptjs_1.default.hash('password123', 10);
        yield user_1.default.create({
            name: 'John Doe',
            email: 'johndoe@example.com',
            password,
        });
        const response = yield (0, supertest_1.default)(serverTest_1.app)
            .post('/login')
            .send({
            email: 'johndoe@example.com',
            password: 'wrongpassword'
        })
            .expect('Content-Type', /json/)
            .expect(400);
        console.log("Response received", response.body);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Invalid Credentials'
            })
        ]));
    }), 20000); // Set timeout to 10 seconds
    it('should return an error if the fields are missing', () => __awaiter(void 0, void 0, void 0, function* () {
        jest.setTimeout(10000); // Set timeout to 10 seconds
        console.log("Starting test: should return an error if the fields are missing");
        const response = yield (0, supertest_1.default)(serverTest_1.app)
            .post('/login')
            .send({
            email: ''
        })
            .expect('Content-Type', /json/)
            .expect(400);
        console.log("Response received", response.body);
        expect(response.body.errors).toEqual(expect.arrayContaining([
            expect.objectContaining({
                msg: 'Password is required'
            })
        ]));
    }), 20000); // Set timeout to 10 seconds
});
