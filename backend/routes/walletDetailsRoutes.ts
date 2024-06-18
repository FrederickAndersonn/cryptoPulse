// ../routes/wallet.ts

import express from 'express';
import jwt from 'jsonwebtoken';
const {
  Horizon,
} = require('@stellar/stellar-sdk');
import User from '../models/user';


const router = express.Router();
const jwtSecret = "my secret token";
const server = new Horizon.Server('https://horizon-testnet.stellar.org');


const authMiddleware = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ msg: 'Authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { user: { id: string } };
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Invalid token' });
  }
};


router.get('/details', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Load user's Stellar account details
    const account = await server.loadAccount(user.publicKey);

    // Extract relevant wallet details
    const balance = account.balances.find((bal: any) => bal.asset_type === 'native');
    const walletDetails = {
      balance: balance ? balance.balance : '0',
      publicKey: user.publicKey,
      address: account.account_id, // Adding the wallet address (account ID)
    };
    console.log(walletDetails);

    res.json(walletDetails);
  } catch (err) {
    console.error('Error fetching wallet details:', err);
    res.status(500).send('Server Error');
  }
});

export default router;
