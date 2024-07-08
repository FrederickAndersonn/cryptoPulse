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
const user_1 = __importDefault(require("../models/user"));
const auth_1 = __importDefault(require("../middleware/auth")); // Import the auth middleware
const router = express_1.default.Router();
// Fetch User Details Route
router.get('/profile', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.user.id).select('-password -secretKey');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
}));
// Update Password Route
router.put('/update-password', auth_1.default, // Ensure the route is protected
[
    (0, express_validator_1.check)('currentPassword', 'Current password is required').not().isEmpty(),
    (0, express_validator_1.check)('newPassword', 'Please enter a new password with 5 or more characters').isLength({ min: 5 }),
], (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { currentPassword, newPassword } = req.body;
    try {
        const user = yield user_1.default.findById(req.user.id); // Assert non-null user
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const isMatch = yield bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Incorrect current password' });
        }
        const salt = yield bcryptjs_1.default.genSalt(10);
        user.password = yield bcryptjs_1.default.hash(newPassword, salt);
        yield user.save();
        res.json({ msg: 'Password updated successfully' });
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
}));
// Add coin to watchlist
router.put('/:id/watchlist', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const { coinId } = req.body;
        if (!user.watchlist.includes(coinId)) {
            user.watchlist.push(coinId);
            yield user.save();
            res.json(user.watchlist);
        }
        else {
            res.status(400).json({ msg: 'Coin already in watchlist' });
        }
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error adding to watchlist:', error.message);
        }
        res.status(500).send('Server error');
    }
}));
// Get user's watchlist
router.get('/:id/watchlist', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user.watchlist);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error fetching watchlist:', error.message);
        }
        res.status(500).send('Server error');
    }
}));
// Remove coin from watchlist
router.delete('/:id/watchlist/:coinId', auth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_1.default.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        const coinId = req.params.coinId;
        user.watchlist = user.watchlist.filter((id) => id !== coinId);
        yield user.save();
        res.json(user.watchlist);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error removing from watchlist:', error.message);
        }
        res.status(500).send('Server error');
    }
}));
exports.default = router;
