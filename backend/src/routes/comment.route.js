import { Router } from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import { createComment, deleteComment, getComment } from "../controllers/comment.controller.js";

const router = Router()

router.route("/post/:postId").get(getComment)

router.route("/post/:postId").post(protectRoute, createComment)
router.route("/:commentId").delete(protectRoute, deleteComment)

export default router;