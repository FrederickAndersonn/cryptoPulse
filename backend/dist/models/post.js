"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const postSchema = new mongoose_1.Schema({
    author: {
        id: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: { type: String, required: true },
        publicKey: { type: String, required: true } // New attribute
    },
    heading: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, default: Date.now },
    votes: { type: Number, default: 0 },
    votedBy: [
        {
            userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
            vote: { type: Number, required: true }
        }
    ],
    comments: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Comment'
        }
    ]
});
exports.default = (0, mongoose_1.model)('Post', postSchema);
