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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
const user_1 = __importDefault(require("../models/user"));
const post_1 = __importDefault(require("../models/post"));
// Helper function to extract user ID from JWT token
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
// Get all posts
router.get('/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield post_1.default.find().populate('author.id', 'name publicKey');
        res.json(posts);
    }
    catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Server error');
    }
}));
// Get all posts by a user
router.get('/users/:userId/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const posts = yield post_1.default.find({ 'author.id': req.params.userId });
        res.json(posts);
    }
    catch (error) {
        console.error('Error fetching user posts:', error);
        res.status(500).send('Server error');
    }
}));
// Get a single post
router.get('/posts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const post = yield post_1.default.findById(req.params.id).populate({
            path: 'comments',
            populate: { path: 'author.id', select: 'name' }
        }).exec();
        if (!post) {
            return res.status(404).send('Post not found');
        }
        res.json(post);
    }
    catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).send('Server error');
    }
}));
// Create a new post
router.post('/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserIdFromToken(req);
    if (!userId) {
        return res.status(401).send('Unauthorized');
    }
    try {
        console.log('Creating a new post with data:', req.body);
        const user = yield user_1.default.findById(userId);
        if (!user) {
            return res.status(404).send('User not found');
        }
        const newPost = new post_1.default(Object.assign(Object.assign({}, req.body), { author: {
                id: new mongoose_1.Types.ObjectId(userId),
                username: user.name,
                publicKey: user.publicKey, // Include publicKey here
            } }));
        yield newPost.save();
        // Update user's posts array
        user.posts.push(newPost._id);
        yield user.save();
        console.log('Post created successfully:', newPost);
        res.status(201).json(newPost);
    }
    catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send(error);
    }
}));
// Update a post
router.put('/posts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserIdFromToken(req);
    try {
        console.log(`Updating post with id: ${req.params.id} with data:`, req.body);
        const post = yield post_1.default.findById(req.params.id);
        if (!post) {
            console.log('Post not found');
            return res.status(404).send('Post not found');
        }
        if (post.author.id.toString() !== userId) {
            return res.status(403).send('Unauthorized');
        }
        const updatedPost = yield post_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        console.log('Post updated successfully:', updatedPost);
        res.json(updatedPost);
    }
    catch (error) {
        console.error(`Error updating post with id ${req.params.id}:`, error);
        res.status(500).send(error);
    }
}));
// Delete a post
router.delete('/posts/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserIdFromToken(req);
    try {
        console.log(`Deleting post with id: ${req.params.id}`);
        const post = yield post_1.default.findById(req.params.id);
        if (!post) {
            console.log('Post not found');
            return res.status(404).send('Post not found');
        }
        if (post.author.id.toString() !== userId) {
            return res.status(403).send('Unauthorized');
        }
        const deletedPost = yield post_1.default.findByIdAndDelete(req.params.id);
        console.log('Post deleted successfully:', deletedPost);
        // Remove post reference from user
        yield user_1.default.findByIdAndUpdate(userId, { $pull: { posts: req.params.id } });
        res.json({ message: 'Post deleted successfully' });
    }
    catch (error) {
        console.error(`Error deleting post with id ${req.params.id}:`, error);
        res.status(500).send(error);
    }
}));
// Upvote or Downvote a post
router.post('/posts/:postId/vote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = getUserIdFromToken(req);
    const { vote } = req.body; // Expect vote to be 1 for upvote and -1 for downvote
    if (!userId) {
        return res.status(401).send('Unauthorized');
    }
    if (![1, -1].includes(vote)) {
        return res.status(400).send('Invalid vote value');
    }
    try {
        const post = yield post_1.default.findById(req.params.postId);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        const userObjectId = new mongoose_1.Types.ObjectId(userId);
        const existingVote = post.votedBy.find(v => v.userId.equals(userObjectId));
        if (existingVote) {
            if (existingVote.vote === vote) {
                // User is toggling the same vote, so remove the vote
                post.votes -= vote;
                post.votedBy = post.votedBy.filter(v => !v.userId.equals(userObjectId));
            }
            else {
                // User is switching vote, so adjust the vote accordingly
                post.votes += 2 * vote; // because it's effectively changing from -1 to +1 or vice versa
                existingVote.vote = vote;
            }
        }
        else {
            // User is voting for the first time
            post.votes += vote;
            post.votedBy.push({ userId: userObjectId, vote });
        }
        yield post.save();
        res.json(post);
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err.message);
        }
        res.status(500).send('Server Error');
    }
}));
exports.default = router;
