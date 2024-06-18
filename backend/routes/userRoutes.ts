// ../routes/users.ts

import express from 'express';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const router = express.Router();
const jwtSecret = "my secret token";
const StellarSdk = require('stellar-sdk');

// Function to fund newly created Stellar account with initial balance
const fundAccount = async (publicKey: string) => {
  try {
    const response = await fetch(
      `https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`
    );
    const data = await response.json();
    return data;
  } catch (e) {
    return e;
  }
};

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a proper email').isEmail(),
    check('password', 'Please enter a password with 5 or more characters').isLength({ min: 5 }),
  ],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // Check if user exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      // Create new Stellar keypair
      const keypair = StellarSdk.Keypair.random();
      const publicKey = keypair.publicKey();
      const secretKey = keypair.secret();

      // Fund Stellar account with initial balance using Friendbot
      await fundAccount(publicKey);

      // Encrypt user's password
      const newUser = new User({
        name,
        email,
        password,
        publicKey,
        secretKey
      });

      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
      await newUser.save();

      // Return JWT token
      const payload = {
        user: {
          id: newUser.id,
        },
      };

      jwt.sign(
        payload,
        jwtSecret,
        { expiresIn: 360000 },
        (err, token) => {
          if (err) {
            throw err;
          } else {
            res.json({ token, userid: payload.user.id });
          }
        }
      );
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).send('Server error');
  }
});

export default router;
