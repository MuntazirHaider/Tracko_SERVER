import { Router } from "express";
import { createUser, getUserByUsername, getUsers, updateProfile, updateUser } from "../controllers/userController";
import { verifyToken } from "../middleware/auth";
import { roleBasedGuard } from "../middleware/roleBasedGuard";

const router = Router();

router.get("/", verifyToken, getUsers);
router.get("/:username", verifyToken, getUserByUsername);
router.post("/", verifyToken, roleBasedGuard(['Admin', 'Project Manager']), createUser);
router.put("/", verifyToken, roleBasedGuard(['Admin', 'Project Manager'], true), updateUser);
router.patch("/", verifyToken, updateProfile);

export default router;
