import { getAuth } from "@clerk/express";
import Notification from "../models/notification.model.js";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";
import Comment from "../models/comment.model.js";

export const getPosts = async (_, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("user", "username firstname lastname avatar")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "username firstname lastname avatar",
                },
            });

        res.status(200).json({
            success: true,
            posts,
            message: "Posts fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

export const getPostById = async (req, res) => {
    try {
        const { postId } = req.params;

        if (!postId) {
            throw new Error("Post id is required")
        }
        const posts = await Post.findById(postId)
            .sort({ createdAt: -1 })
            .populate("user", "username firstname lastname avatar")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "username firstname lastname avatar",
                },
            });

        return res.status(200).json({
            success: true,
            posts,
            message: "Posts fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

export const getUsersPost = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            throw new Error("Username is required")
        }

        const user = await User.findOne({ username })

        if (!user) {
            throw new Error("Invalid Username")
        }

        const posts = await Post.find({ user: user._id })
            .sort({ createdAt: -1 })
            .populate("user", "username firstname lastname avatar")
            .populate({
                path: "comments",
                populate: {
                    path: "user",
                    select: "username firstname lastname avatar",
                },
            });

        return res.status(200).json({
            success: true,
            posts,
            message: "Posts fetched successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

export const createPost = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const { content } = req.body;
        const imageFile = req.file;

        if (!content && !imageFile) {
            return res.status(400).json({
                success: false,
                message: "Post must contain either text or an image",
            });
        }

        const user = await User.findOne({ clerkId: userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        let imageUrl = "";
        if (imageFile) {
            try {
                // may have error - chatgpt generated - check again
                const base64Image = `data:${imageFile.mimetype};base64,${imageFile.buffer.toString("base64")}`;
                const uploadResponse = await cloudinary.uploader.upload(base64Image, {
                    folder: "FlareFeed",
                });

                imageUrl = uploadResponse.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary Upload Error:", uploadError);
                return res.status(400).json({
                    success: false,
                    message: "Failed to upload image",
                });
            }
        }

        const post = await Post.create({
            user: user._id,
            content: content || "",
            image: imageUrl,
        });

        return res.status(201).json({
            success: true,
            message: "Post created successfully",
            post,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

export const likePost = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        const { postId } = req.params;

        if (!postId || !userId) {
            throw new Error("Id's are required")
        }

        const user = await User.findOne({ clerkId: userId })
        const post = await Post.findById(postId)

        if (!user || !post) {
            throw new Error("User or Post not Found")
        }

        const isLiked = post.likes.includes(user._id)

        if (isLiked) {
            await Post.findByIdAndUpdate(postId, {
                $pull: {
                    likes: user._id
                }
            })
        } else {
            await Post.findByIdAndUpdate(postId, {
                $push: {
                    likes: user._id
                }
            })
        }

        if (post.user.toString() !== user._id.toString) {
            await Notification.create({
                from: user._id,
                to: post.user,
                type: "like",
                post: postId
            })
        }

        return res.status(200).json({
            success: true,
            message: isLiked ? "Post unliked Successfully" : "Post liked successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}

export const deletePost = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        const { postId } = req.params;

        if (!userId || !postId) {
            throw new Error("Id's are Required!")
        }

        const user = await User.findOne({ clerkId: userId })
        const post = await Post.findById(postId)

        if (!user || !post) {
            throw new Error("User or Post not Found")
        }

        if (post.user.toString() !== user._id.toString()) {
            throw new Error("You can only delete your own posts!");
        }
        await Comment.deleteMany({ post: postId })
        await Post.findByIdAndDelete(postId)

        return res.status(200).json({
            success: true,
            message: "Post deleted Successfully!"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
}