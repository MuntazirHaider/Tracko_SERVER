import { Router } from "express";
import { createProjects, getProjects } from "../controllers/projectController";
import { verifyToken } from "../middleware/auth";
import { roleBasedGuard } from "../middleware/roleBasedGuard";

const router = Router();

router.get("/", verifyToken, getProjects);
router.post("/", verifyToken, roleBasedGuard(['Admin', 'Project Manager']), createProjects);

export default router;
