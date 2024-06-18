import express from 'express';
import bcrypt from 'bcryptjs';
import { check, validationResult } from 'express-validator';
import User from '../models/user';
import auth from '../middleware/auth'; // Import the auth middleware

const router = express.Router();

// Fetch User Details Route
router.get('/profile', auth, async (req: express.Request, res: express.Response) => {
  try {
    const user = await User.findById(req.user!.id).select('-password -secretKey');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update Password Route
router.put(
  '/update-password',
  auth,  // Ensure the route is protected
  [
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'Please enter a new password with 5 or more characters').isLength({ min: 5 }),
  ],
  async (req: express.Request, res: express.Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    try {
      const user = await User.findById(req.user!.id); // Assert non-null user
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Incorrect current password' });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
      await user.save();

      res.json({ msg: 'Password updated successfully' });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

export default router;
