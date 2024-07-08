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
const mongoose_1 = require("mongoose");
const router = express_1.default.Router();
const user_1 = __importDefault(require("../models/user"));
const comment_1 = __importDefault(require("../models/comment"));
const post_1 = __importDefault(require("../models/post"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getUserIdFromToken = (req) => {
    var _a;
    const token = (_a = req.header('Authorization')) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
    if (!token)
        return null;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, 'my secret token'); // Use your JWT secret
        return decoded.user.id;
    }
    catch (err) {
        return null;
    }
};
router.post('/create', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserIdFromToken(req);
    const postId = req.header('postid');
    if (!userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const user = yield user_1.default.findById(userId).exec();
        if (!user) {
            return res.status(404).send('User not found');
        }
        const post = yield post_1.default.findById(postId).exec();
        if (!post) {
            return res.status(404).send('Post not found');
        }
        const newComment = new comment_1.default(req.body);
        newComment.author.id = new mongoose_1.Types.ObjectId(userId);
        newComment.author.username = user.name;
        newComment.post.id = new mongoose_1.Types.ObjectId(postId);
        yield newComment.save();
        // Update user's comments array
        user.comments.push(newComment._id);
        yield user.save();
        post.comments.push(newComment._id); // Push the comment's _id instead of the comment itself
        yield post.save();
        res.status(200).send("Comment created and linked to user and post");
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}));
router.get('/getcomments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postId = req.header('postid');
    try {
        const post = yield post_1.default.findById(postId).populate('comments').exec();
        if (!post) {
            res.status(404).send('Post not found');
            return;
        }
        res.status(200).send(post.comments);
    }
    catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
}));
router.put('/editcomment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserIdFromToken(req);
    const commentId = req.header('commentid');
    const commentauthorid = req.header('commentauthorid');
    if (userId !== commentauthorid) {
        return res.status(403).send('Unauthorized');
    }
    try {
        const foundComment = yield comment_1.default.findByIdAndUpdate(commentId, { text: req.body.text }).exec();
        if (!foundComment) {
            res.status(404).send('Comment not found');
            return;
        }
        yield foundComment.save();
        res.status(200).send("Comment updated");
    }
    catch (err) {
        res.status(500).send(err);
    }
}));
router.delete('/deletecomment', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserIdFromToken(req);
    const commentId = req.header('commentid');
    const commentauthorid = req.header('commentauthorid');
    if (userId !== commentauthorid) {
        return res.status(403).send('Unauthorized');
    }
    try {
        const foundComment = yield comment_1.default.findByIdAndDelete(commentId).exec();
        if (!foundComment) {
            res.status(404).send('Comment not found');
            return;
        }
        res.status(200).send('Comment deleted');
    }
    catch (err) {
        res.status(500).send(err);
    }
}));
router.post('/:commentId/like', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserIdFromToken(req);
    if (!userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const comment = yield comment_1.default.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).send('Comment not found');
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        if (comment.likedBy.includes(userObjectId)) {
            // User already liked the comment, undo the like
            comment.likes -= 1;
            comment.likedBy = comment.likedBy.filter((id) => !id.equals(userObjectId));
        }
        else {
            // User has not liked the comment yet
            // Remove from dislikedBy if exists
            if (comment.dislikedBy.includes(userObjectId)) {
                comment.dislikedBy = comment.dislikedBy.filter((id) => !id.equals(userObjectId));
            }
            comment.likes += 1;
            comment.likedBy.push(userObjectId);
        }
        yield comment.save();
        res.json(comment);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
}));
router.post('/:commentId/unlike', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserIdFromToken(req);
    if (!userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        const comment = yield comment_1.default.findById(req.params.commentId);
        if (!comment) {
            return res.status(404).send('Comment not found');
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        if (comment.dislikedBy.includes(userObjectId)) {
            // User already disliked the comment, undo the dislike
            comment.likes += 1; // Dislike undone, increase the likes count
            comment.dislikedBy = comment.dislikedBy.filter((id) => !id.equals(userObjectId));
        }
        else {
            // User has not disliked the comment yet
            // Remove from likedBy if exists
            if (comment.likedBy.includes(userObjectId)) {
                comment.likes -= 1;
                comment.likedBy = comment.likedBy.filter((id) => !id.equals(userObjectId));
            }
            comment.likes -= 1;
            comment.dislikedBy.push(userObjectId);
        }
        yield comment.save();
        res.json(comment);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
}));
exports.default = router;
