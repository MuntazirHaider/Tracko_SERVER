import { Router } from "express";
import {
    createAttachment,
  createComment,
  createTask,
  deleteTask,
  getTasks,
  getUserTasks,
  updateTaskStatus,
} from "../controllers/taskController";
import { verifyToken } from "../middleware/auth";
import { roleBasedGuard } from "../middleware/roleBasedGuard";

const router = Router();

router.get("/", verifyToken, getTasks);
router.post(
  "/",
  verifyToken,
  roleBasedGuard(["Admin", "Project Manager"]),
  createTask
);
router.patch(
  "/:taskId/status",
  verifyToken,
  roleBasedGuard(["Admin", "Project Manager", "Developer"]),
  updateTaskStatus
);
router.get("/user/:userId", verifyToken, getUserTasks);
router.delete("/:taskId", verifyToken, deleteTask);
router.post("/comment", verifyToken, createComment);
router.post("/attachment", verifyToken, createAttachment);

export default router;
