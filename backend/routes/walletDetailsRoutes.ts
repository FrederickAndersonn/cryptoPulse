import express from 'express';
import jwt from 'jsonwebtoken';
const { Horizon, Keypair, StellarSdk, TransactionBuilder, BASE_FEE, Networks, Asset, Operation, Memo } = require('@stellar/stellar-sdk');
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

    const account = await server.loadAccount(user.publicKey);
    const balance = account.balances.find((bal: any) => bal.asset_type === 'native');
    const walletDetails = {
      balance: balance ? balance.balance : '0',
      publicKey: user.publicKey,
      address: account.account_id,
    };
    res.json(walletDetails);
  } catch (err) {
    console.error('Error fetching wallet details:', err);
    res.status(500).send('Server Error');
  }
});

export async function sendFunds(destinationID: string, secretKey: string, amount: string): Promise<any> {
    const sourceKeys = Keypair.fromSecret(secretKey);
    let transaction;
    server
    .loadAccount(destinationID)
    .catch(function (error : any) {
      if (error instanceof StellarSdk.NotFoundError) {
        throw new Error("The destination account does not exist!");
      } else return error;
    })
    .then(function () {
      return server.loadAccount(sourceKeys.publicKey());
    })
    .then(function (sourceAccount : any) {
      transaction = new TransactionBuilder(sourceAccount, {
        fee: BASE_FEE,
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: destinationID,
            asset: Asset.native(),
            amount: amount,
          }),
        )
        .addMemo(Memo.text("Test Transaction"))
        .setTimeout(180)
        .build();
      transaction.sign(sourceKeys);
      return server.submitTransaction(transaction);
    })
    .then(function (result : any) {
      console.log("Success! Results:", result);
    })
    .catch(function (error : any) {
      console.error("Something went wrong!", error);
    });
  }
  

router.post('/sendfunds', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { destinationID, amount } = req.body;

    if (!req.user) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const result = await sendFunds(destinationID, user.secretKey, amount);
    res.json(result);
  } catch (err) {
    console.error('Error sending funds:', err);
    res.status(500).send('Server Error');
  }
});

export default router;
