import express, { Request, Response } from 'express';
// Removed unused import 'auth'
import User from '../models/user';
import jwt from 'jsonwebtoken';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';

const router = express.Router();
const jwtSecret = "my secret token";

router.post(
  '/',
  [
    check('email', 'Please include a proper email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  async (req: Request, res: Response) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // See if user exists
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
      }

      // Return json webtoken
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        jwtSecret,
        { expiresIn: 360000 }, // optional
        (err, token) => {
          if (err) {
            throw err;
          } else {
            console.log("mypayloadid" + payload.user.id);
            res.json({ token, userid: payload.user.id });
          }
        }
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      }
      res.status(500).send('Server Error');
    }
  }
);

export default router;
