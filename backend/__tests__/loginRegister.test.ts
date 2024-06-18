import request from 'supertest';
import { app, server } from '../serverTest'; // Use the test server
import User from '../models/user';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

const jwtSecret = "my secret token";

afterAll(async () => {
  await server.close();
  await mongoose.connection.close(); // Close the connection to the test database
});

afterEach(async () => {
  await User.deleteMany(); // Clear the users collection after each test
});

describe('POST /register', () => {
  it('should register a new user', async () => {
    jest.setTimeout(10000); // Set timeout to 10 seconds
    console.log("Starting test: should register a new user");

    const response = await request(app)
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

    const user = await User.findOne({ email: 'johndoe@example.com' });
    expect(user).not.toBeNull();
    if (user) {
      expect(user.name).toBe('John Doe');
    }
  }, 10000); // Set timeout to 10 seconds

  it('should return an error if the email already exists', async () => {
    jest.setTimeout(10000); // Set timeout to 10 seconds
    console.log("Starting test: should return an error if the email already exists");

    await User.create({
      name: 'Existing User',
      email: 'existing@example.com',
      password: await bcrypt.hash('password123', 10),
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

    console.log("Response received", response.body);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'User already exists'
        })
      ])
    );
  }, 10000); // Set timeout to 10 seconds
});

describe('POST /login', () => {
  it('should login successfully with correct credentials', async () => {
    jest.setTimeout(10000); // Set timeout to 10 seconds
    console.log("Starting test: should login successfully with correct credentials");

    const password = await bcrypt.hash('password123', 10);

    await User.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password,
    });

    const response = await request(app)
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
  }, 10000); // Set timeout to 10 seconds

  it('should return an error if the email does not exist', async () => {
    jest.setTimeout(10000); // Set timeout to 10 seconds
    console.log("Starting test: should return an error if the email does not exist");

    const response = await request(app)
      .post('/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'password123'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    console.log("Response received", response.body);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Invalid credentials'
        })
      ])
    );
  }, 10000); // Set timeout to 10 seconds

  it('should return an error if the password is incorrect', async () => {
    jest.setTimeout(10000); // Set timeout to 10 seconds
    console.log("Starting test: should return an error if the password is incorrect");

    const password = await bcrypt.hash('password123', 10);

    await User.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password,
    });

    const response = await request(app)
      .post('/login')
      .send({
        email: 'johndoe@example.com',
        password: 'wrongpassword'
      })
      .expect('Content-Type', /json/)
      .expect(400);

    console.log("Response received", response.body);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Invalid Credentials'
        })
      ])
    );
  }, 10000); // Set timeout to 10 seconds

  it('should return an error if the fields are missing', async () => {
    jest.setTimeout(10000); // Set timeout to 10 seconds
    console.log("Starting test: should return an error if the fields are missing");

    const response = await request(app)
      .post('/login')
      .send({
        email: ''
      })
      .expect('Content-Type', /json/)
      .expect(400);

    console.log("Response received", response.body);

    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          msg: 'Password is required'
        })
      ])
    );
  }, 10000); // Set timeout to 10 seconds
});
