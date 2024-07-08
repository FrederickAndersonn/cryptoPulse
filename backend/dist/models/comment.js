"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commentSchema = new mongoose_1.Schema({
    author: {
        id: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        username: { type: String, required: true }
    },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    likes: { type: Number, default: 0 },
    likedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    dislikedBy: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }], // Added dislikedBy array
    post: {
        id: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Post',
            required: true
        }
    }
});
exports.default = (0, mongoose_1.model)('Comment', commentSchema);
