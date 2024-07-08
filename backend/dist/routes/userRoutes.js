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
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_validator_1 = require("express-validator");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_1 = __importDefault(require("../models/user"));
const encryption_1 = require("../utils/encryption");
const stellar_sdk_1 = __importDefault(require("stellar-sdk")); // Replaced require with import
const router = express_1.default.Router();
const jwtSecret = "my secret token";
// Function to fund newly created Stellar account with initial balance
const fundAccount = (publicKey) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(`https://friendbot.stellar.org?addr=${encodeURIComponent(publicKey)}`);
        const data = yield response.json();
        return data;
    }
    catch (e) {
        return e;
    }
});
router.post('/', [
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('email', 'Please include a proper email').isEmail(),
    (0, express_validator_1.check)('password', 'Please enter a password with 5 or more characters').isLength({ min: 5 }),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
        // Check if user exists
        const existingUser = yield user_1.default.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
        // Create new Stellar keypair
        const keypair = stellar_sdk_1.default.Keypair.random();
        const publicKey = keypair.publicKey();
        const secretKey = keypair.secret();
        // Fund Stellar account with initial balance using Friendbot
        yield fundAccount(publicKey);
        // Encrypt the secret key
        const encryptedSecretKey = (0, encryption_1.encrypt)(secretKey);
        // Encrypt user's password
        const newUser = new user_1.default({
            name,
            email,
            password,
            publicKey,
            secretKey: encryptedSecretKey
        });
        const salt = yield bcryptjs_1.default.genSalt(10);
        newUser.password = yield bcryptjs_1.default.hash(password, salt);
        yield newUser.save();
        // Return JWT token
        const payload = {
            user: {
                id: newUser.id,
            },
        };
        jsonwebtoken_1.default.sign(payload, jwtSecret, { expiresIn: 360000 }, (err, token) => {
            if (err) {
                throw err;
            }
            else {
                res.json({ token, userid: payload.user.id });
            }
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
}));
router.get('/user/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.params.id).select('name');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        console.error('Error fetching user details:', error);
        res.status(500).send('Server error');
    }
}));
exports.default = router;
