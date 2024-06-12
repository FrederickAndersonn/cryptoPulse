import express from 'express';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import User from '../models/user';

const router = express.Router();
const jwtSecret = "my secret token";


router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a proper email').isEmail(), // email format
    check('password', 'Please enter a password with 5 or more characters').isLength({ min: 5 })
  ],
  async (req: express.Request, res: express.Response) => {
    console.log(req);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      // See if user exists
      let existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      // Encrypt users password
      const newUser = new User({
        name,
        email,
        password
      });

      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);
      await newUser.save();

      // Return json webtoken
      const payload = {
        user: {
          id: newUser.id
        }
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

export default router;
