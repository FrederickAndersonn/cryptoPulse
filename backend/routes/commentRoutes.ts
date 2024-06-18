import express, { Request, Response } from 'express';
import { Types } from 'mongoose';
const router = express.Router();
import User from '../models/user';
import Comment from '../models/comment';
import Post from '../models/post';

router.post('/create', async (req: Request, res: Response) => {
    const userId = req.header('userid') as string;
    const postId = req.header('postid') as string;
    try {
        const user = await User.findById(userId).exec();
        if (!user) {
            res.status(404).send('User not found');
            return;
        }
        const post = await Post.findById(postId).exec();
        if (!post) {
            res.status(404).send('Post not found');
            return;
        }
        const newComment = await Comment.create(req.body);
        newComment.author.id = new Types.ObjectId(userId);
        newComment.author.username = user.name;
        newComment.post.id = new Types.ObjectId(postId);
        await newComment.save();
        post.comments.push(newComment._id); // Push the comment's _id instead of the comment itself
        await post.save();
        res.status(200).send("Comment created and linked to user and post");
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.get('/getcomments', async (req: Request, res: Response) => {
    const postId = req.header('postid') as string;
    try {
        const post = await Post.findById(postId).populate('comments').exec();
        if (!post) {
            res.status(404).send('Post not found');
            return;
        }
        res.status(200).send(post.comments);
    } catch (err) {
        console.log(err);
        res.status(500).send(err);
    }
});

router.put('/editcomment', async (req: Request, res: Response) => {
    const userId = req.header('userid') as string;
    const commentId = req.header('commentid') as string;
    const commentauthorid = req.header('commentauthorid') as string;

    if (userId === commentauthorid) {
        try {
            const foundComment = await Comment.findByIdAndUpdate(commentId, { text: req.body.text }).exec();
            if (!foundComment) {
                res.status(404).send('Comment not found');
                return;
            }
            await foundComment.save();
            res.status(200).send("Comment updated");
        } catch (err) {
            res.status(500).send(err);
        }
    } else {
        res.status(403).send('Unauthorized');
    }
});

router.delete('/deletecomment', async (req: Request, res: Response) => {
    const userId = req.header('userid') as string;
    const commentId = req.header('commentid') as string;
    const commentauthorid = req.header('commentauthorid') as string;

    if (userId === commentauthorid) {
        try {
            const foundComment = await Comment.findByIdAndDelete(commentId).exec();
            if (!foundComment) {
                res.status(404).send('Comment not found');
                return;
            }
            res.status(200).send('Comment deleted');
        } catch (err) {
            res.status(500).send(err);
        }
    } else {
        res.status(403).send('Unauthorized');
    }
});

export default router;
