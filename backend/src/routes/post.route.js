import { Router } from "express";
import { createPost, deletePost, getPostById, getPosts, getUsersPost, likePost } from "../controllers/post.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router()

router.route("/").get(getPosts)
router.route("/:postId").get(getPostById)
router.route("/user/:username").get(getUsersPost)


router.route("/").post(protectRoute, upload.single("image"), createPost)
router.route("/:postId/like").post(protectRoute, likePost)

router.route("/:postId").delete(protectRoute, deletePost)
export default router;