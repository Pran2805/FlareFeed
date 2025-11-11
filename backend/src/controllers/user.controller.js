import { clerkClient, getAuth } from "@clerk/express";
import User from "../models/user.model.js";

export const getUserProfile = async (req, res) => {
    try {
        const { username } = req.params;

        if (!username) {
            throw new Error("Username not found")
        }

        const user = await User.findOne({ username })
        if (!user) {
            throw new Error("User not found")
        }

        return res.status(200).json({
            message: "User profile Found",
            success: true,
            user
        })
    } catch (error) {
        return res.status(400).json({
            message: error?.message || "Internal Server Error",
            success: false
        })
    }
}

export const updateProfile = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const data = req.body;

        if (!data) {
            throw new Error("Data is not given for updation.")
        }

        const user = await User.findOneAndUpdate({ clerkId: userId }, data, { new: true })
        if (!user) {
            throw new Error("User not found")
        }
        return res.status(200).json({
            message: "User updated successfully",
            user,
            success: true
        })
    } catch (error) {
        return res.status(400).json({
            message: error?.message || "Internal Server Error",
            success: false
        })
    }
}

export const syncUser = async (req, res) => {
    try {
        const { userId } = getAuth(req);
        const existingUser = await User.findOne({ clerkId: userId })
        if (existingUser) {
            return res.status(200).json({
                user: existingUser,
                message: "User already exists",
                success: true
            })
        }

        const clerkUser = await clerkClient.users.getUser(userId)

        const userData = {
            clerkId: userId,
            email: clerkUser.emailAddresses[0].emailAddress,
            firstName: clerkUser.firstName || "",
            lastName: clerkUser.lastName || "",
            username: clerkUser.emailAddresses[0].emailAddress.split("@")[0],
            avatar: clerkUser.imageUrl || ""
        }

        const user = await User.create(userData)
        return res.status(200).json({
            message: "User created successfully",
            user,
            success: true
        })
    } catch (error) {
        return res.status(400).json({
            message: error?.message || "Internal Server Error",
            success: false
        })
    }
}
export const getUserData = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        const user = await User.findOne({ clerkId: userId })

        if (!user) {
            throw new Error("User not Found")
        }
        return res.status(200).json({
            user,
            success: true
        })
    } catch (error) {
        return res.status(400).json({
            message: error?.message || "Internal Server Error",
            success: false
        })
    }
}

export const followUser = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        const { id } = req.params

        if (!userId || !id) {
            throw new Error("Id is required")
        }

        if (userId === id) {
            throw new Error("You cannot follow yourself")
        }

        const thisUser = await User.findOne({ clerkId: userId })
        const followUser = await User.findOne(id)

        if (!thisUser || !followUser) {
            throw new Error("User not Found")
        }

        const isFollowing = thisUser.following.includes(id)

        if (isFollowing) {
            await User.findByIdAndUpdate(thisUser._id, {
                $pull: {
                    following: id
                }
            })
            await User.findByIdAndUpdate(id, {
                $pull: {
                    following: thisUser._id
                }
            })
        } else {
            await User.findByIdAndUpdate(thisUser._id, {
                $push: {
                    following: id
                }
            })
            await User.findByIdAndUpdate(id, {
                $push: {
                    following: thisUser._id
                }
            })
        }

        await Notification.create({
            from: thisUser._id,
            to: id,
            type: "follow"
        })
        return res.status(200).json({
            message: isFollowing ? "User unfollowed Successfully" : "User followed successfully",
            success: true
        })
    } catch (error) {
        return res.status(400).json({
            message: error?.message || "Internal Server Error",
            success: false
        })
    }
}
export const acceptRequest = async (req, res) => {
    try {
        const { userId } = getAuth(req)
        const user = await User.findOne({ clerkId: userId })

        if (!user) {
            throw new Error("User not Found")
        }
        return res.status(200).json({
            user,
            success: true
        })
    } catch (error) {
        return res.status(400).json({
            message: error?.message || "Internal Server Error",
            success: false
        })
    }
}