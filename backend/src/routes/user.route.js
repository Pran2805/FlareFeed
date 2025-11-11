import { Router } from "express";
import { followUser, getUserData, getUserProfile, syncUser, updateProfile } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = Router()


router.route("/profile/:username").get(getUserProfile)
router.route("/sync").post(protectRoute, syncUser)
router.route("/me").post(protectRoute, getUserData)
router.route("/profile").put(protectRoute, updateProfile)

router.route("/follow/:id").post(protectRoute, followUser)
export default router;