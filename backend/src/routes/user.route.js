import { Router } from "express";
import { followUser, getUserData, getUserProfile, syncUser, updateProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/me").get(protectRoute, getUserData)
router.route("/profile/:username").get(getUserProfile)

router.route("/sync").post(protectRoute, syncUser)
router.route("/follow/:id").post(protectRoute, followUser)

router.route("/profile").put(protectRoute, updateProfile)

export default router;