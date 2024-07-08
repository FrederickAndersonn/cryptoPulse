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
exports.sendFunds = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const stellar_sdk_1 = __importDefault(require("stellar-sdk"));
const stellar_sdk_2 = require("stellar-sdk");
const user_1 = __importDefault(require("../models/user"));
const encryption_1 = require("../utils/encryption");
const router = express_1.default.Router();
const jwtSecret = "my secret token";
const server = new stellar_sdk_2.Horizon.Server('https://horizon-testnet.stellar.org');
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ msg: 'Authorization denied' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        req.user = decoded.user;
        next();
    }
    catch (err) {
        res.status(401).json({ msg: 'Invalid token' });
    }
});
router.get('/details', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'User not authenticated' });
        }
        const user = yield user_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const account = yield server.loadAccount(user.publicKey);
        const balance = account.balances.find((bal) => bal.asset_type === 'native');
        const walletDetails = {
            balance: balance ? balance.balance : '0',
            publicKey: user.publicKey,
            address: account.account_id,
        };
        res.json(walletDetails);
    }
    catch (err) {
        console.error('Error fetching wallet details:', err);
        res.status(500).send('Server Error');
    }
}));
function sendFunds(destinationID, encryptedSecretKey, publicKey, amount, memo) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const secretKey = (0, encryption_1.decrypt)(encryptedSecretKey);
            const sourceKeys = stellar_sdk_2.Keypair.fromSecret(secretKey);
            let transaction;
            yield server.loadAccount(destinationID)
                .catch(function (error) {
                if (error instanceof stellar_sdk_1.default.NotFoundError) {
                    throw new Error("The destination account does not exist!");
                }
                else
                    return error;
            })
                .then(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const sourceAccount = yield server.loadAccount(sourceKeys.publicKey());
                    transaction = new stellar_sdk_2.TransactionBuilder(sourceAccount, {
                        fee: stellar_sdk_2.BASE_FEE,
                        networkPassphrase: stellar_sdk_2.Networks.TESTNET,
                    })
                        .addOperation(stellar_sdk_2.Operation.payment({
                        destination: destinationID,
                        asset: stellar_sdk_2.Asset.native(),
                        amount: amount,
                    }))
                        .addMemo(stellar_sdk_2.Memo.text(memo))
                        .setTimeout(180)
                        .build();
                    transaction.sign(sourceKeys);
                    const result = yield server.submitTransaction(transaction);
                    // Save transaction ID to user's document
                    const transactionId = result.hash;
                    yield saveTransactionToUser(transactionId, publicKey);
                    return result;
                });
            })
                .then(function (result) {
                console.log("Success! Results:", result);
                return result;
            })
                .catch(function (error) {
                console.error("Something went wrong!", error);
                throw error;
            });
        }
        catch (error) {
            console.error("Error sending funds:", error);
            throw error;
        }
    });
}
exports.sendFunds = sendFunds;
function saveTransactionToUser(transactionId, publicKey) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = yield user_1.default.findOne({ publicKey: publicKey });
            if (!user) {
                throw new Error('User not found');
            }
            user.transactions.push(transactionId);
            yield user.save();
            console.log(`Transaction ID ${transactionId} saved for user ${user._id}`);
        }
        catch (error) {
            console.error('Error saving transaction to user:', error);
            throw error;
        }
    });
}
router.post('/sendfunds', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { destinationID, amount, memo } = req.body;
        if (!req.user) {
            return res.status(401).json({ msg: 'User not authenticated' });
        }
        const user = yield user_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const result = yield sendFunds(destinationID, user.secretKey, user.publicKey, amount, memo);
        res.json(result);
    }
    catch (err) {
        console.error('Error sending funds:', err);
        res.status(500).send('Server Error');
    }
}));
router.get('/transactions', authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ msg: 'User not authenticated' });
        }
        const user = yield user_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const transactionDetails = yield Promise.all(user.transactions.map((transactionId) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                const transactionLink = `https://horizon-testnet.stellar.org/transactions/${transactionId}`;
                const transactionDetails = yield fetch(transactionLink);
                const transaction = yield transactionDetails.json();
                if (transaction.id) {
                    return {
                        id: transaction.id,
                        memo: transaction.memo,
                        fee_charged: transaction.fee_charged,
                        created_at: transaction.created_at,
                    };
                }
                else {
                    return null; // Transaction not found or invalid link
                }
            }
            catch (error) {
                console.error(`Error fetching transaction ${transactionId} details:`, error);
                return null;
            }
        })));
        // Filter out null values (invalid transactions)
        const validTransactions = transactionDetails.filter(transaction => transaction !== null);
        res.json(validTransactions);
    }
    catch (err) {
        console.error('Error fetching transactions:', err);
        res.status(500).send('Server Error');
    }
}));
exports.default = router;
