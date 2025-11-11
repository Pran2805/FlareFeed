import { Router } from "express";
import userRouter from './user.route.js'
import postRouter from './post.route.js'
const router = Router()

router.use("/users", userRouter)
router.use("/posts", postRouter)

export default router;