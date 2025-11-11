import { getAuth } from "@clerk/express";
import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";

export const getComment = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ post: postId })
            .sort({ createdAt: -1 })
            .populate("user", "username firstName lastName avatar")

        res.status(200).json({
            success: true,
            message: "Get All Comments",
            comments
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}

export const createComment = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        const { postId } = req.params;
        const { content } = req.body;

        if (!userId || !postId) {
            throw new Error("Post ID and user ID is required")
        }

        if (!content || content.trim() === "") {
            throw new Error("Comment Content is required")
        }

        const user = await User.findOne({ clerkId: userId })
        const post = await Post.findById(postId)

        if (!user || !post) {
            throw new Error("User or Post not Found")
        }

        const comment = await Comment.create({
            user: user._id,
            post: postId,
            content
        })

        await Post.findByIdAndUpdate(postId, {
            $push: {
                comments: comment._id
            }
        })

        if (post.user.toString() !== user._id.toString()) {
            await Notification.create({
                from: user._id,
                to: post.user,
                type: "comment",
                post: postId,
                comment: comment._id
            })
        }

        return res.status(201).json({
            comment,
            message: "Message Created Successfully",
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}

export const deleteComment = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        const { commentId } = req.params;

        if (!userId || !commentId) {
            throw new Error("User Id and Comment Id is required")
        }

        const user = await User.findOne({ clerkId: userId })
        const comment = await Comment.findById(commentId)

        if (!user || !comment) {
            throw new Error("User or Comment Not Found")
        }

        if (comment.user.toString() !== user._id.toString()) {
            throw new Error("You can only delete your own comments")
        }

        await Post.findByIdAndUpdate(comment.post, {
            $pull: {
                comments: commentId
            }
        })

        await Comment.findByIdAndDelete(commentId)
        return res.status(200).json({
            message: "Comment Deleted Successfully",
            success: true
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}