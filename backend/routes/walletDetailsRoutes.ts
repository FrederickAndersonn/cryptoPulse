import express from 'express';
import jwt from 'jsonwebtoken';
const { Horizon, Keypair, StellarSdk, TransactionBuilder, BASE_FEE, Networks, Asset, Operation, Memo } = require('@stellar/stellar-sdk');
import User from '../models/user';
import { decrypt, encrypt } from '../utils/encryption'; 

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

export async function sendFunds(destinationID: string, encryptedSecretKey: string, publicKey: string, amount: string, memo: string) {
  try {
    const secretKey = decrypt(encryptedSecretKey); 
    const sourceKeys = Keypair.fromSecret(secretKey);
    let transaction;
    
    await server.loadAccount(destinationID)
      .catch(function (error: any) {
        if (error instanceof StellarSdk.NotFoundError) {
          throw new Error("The destination account does not exist!");
        } else return error;
      })
      .then(async function () {
        const sourceAccount = await server.loadAccount(sourceKeys.publicKey());
        
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
          .addMemo(Memo.text(memo))
          .setTimeout(180)
          .build();

        transaction.sign(sourceKeys);
        const result = await server.submitTransaction(transaction);

        // Save transaction ID to user's document
        const transactionId = result.hash;
        await saveTransactionToUser(transactionId, publicKey);

        return result;
      })
      .then(function (result: any) {
        console.log("Success! Results:", result);
        return result;
      })
      .catch(function (error: any) {
        console.error("Something went wrong!", error);
        throw error;
      });

  } catch (error) {
    console.error("Error sending funds:", error);
    throw error;
  }
}

async function saveTransactionToUser(transactionId: string, publicKey: string): Promise<void> {
  try {
    const user = await User.findOne({ publicKey: publicKey });
    if (!user) {
      throw new Error('User not found');
    }
    user.transactions.push(transactionId);
    await user.save();

    console.log(`Transaction ID ${transactionId} saved for user ${user._id}`);
  } catch (error) {
    console.error('Error saving transaction to user:', error);
    throw error;
  }
}

router.post('/sendfunds', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    const { destinationID, amount, memo } = req.body;

    if (!req.user) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const result = await sendFunds(destinationID, user.secretKey, user.publicKey, amount, memo);
    res.json(result);
  } catch (err) {
    console.error('Error sending funds:', err);
    res.status(500).send('Server Error');
  }
});

router.get('/transactions', authMiddleware, async (req: express.Request, res: express.Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'User not authenticated' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    const transactionDetails = await Promise.all(
      user.transactions.map(async (transactionId) => {
        try {
          const transactionLink = `https://horizon-testnet.stellar.org/transactions/${transactionId}`;
          const transactionDetails = await fetch(transactionLink);
          const transaction = await transactionDetails.json();
          if (transaction.id) {
            return {
              id: transaction.id,
              memo: transaction.memo,
              fee_charged: transaction.fee_charged,
              created_at: transaction.created_at,
            };
          } else {
            return null; // Transaction not found or invalid link
          }
        } catch (error) {
          console.error(`Error fetching transaction ${transactionId} details:`, error);
          return null;
        }
      })
    );

    // Filter out null values (invalid transactions)
    const validTransactions = transactionDetails.filter(transaction => transaction !== null);

    res.json(validTransactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).send('Server Error');
  }
});


export default router;
