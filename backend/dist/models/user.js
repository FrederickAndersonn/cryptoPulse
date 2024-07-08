"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const UserSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    publicKey: {
        type: String,
        required: false,
    },
    secretKey: {
        type: String,
        required: false,
    },
    initialBalance: {
        type: Number,
        required: true,
        default: 0,
    },
    comments: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Comment',
        },
    ],
    posts: [
        {
            type: mongoose_1.default.Schema.Types.ObjectId,
            ref: 'Post',
        },
    ],
    transactions: {
        type: [String], // Array of strings (transaction IDs)
        default: [], // Default value is an empty array
    },
    watchlist: {
        type: [String], // Array of coin IDs
        default: [], // Default value is an empty array
    },
});
exports.default = mongoose_1.default.model('User', UserSchema);
