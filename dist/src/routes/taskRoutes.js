"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const taskController_1 = require("../controllers/taskController");
const auth_1 = require("../middleware/auth");
const roleBasedGuard_1 = require("../middleware/roleBasedGuard");
const router = (0, express_1.Router)();
router.get("/", auth_1.verifyToken, taskController_1.getTasks);
router.post("/", auth_1.verifyToken, (0, roleBasedGuard_1.roleBasedGuard)(["Admin", "Project Manager"]), taskController_1.createTask);
router.patch("/:taskId/status", auth_1.verifyToken, (0, roleBasedGuard_1.roleBasedGuard)(["Admin", "Project Manager", "Developer"]), taskController_1.updateTaskStatus);
router.get("/user/:userId", auth_1.verifyToken, taskController_1.getUserTasks);
router.delete("/:taskId", auth_1.verifyToken, taskController_1.deleteTask);
router.post("/comment", auth_1.verifyToken, taskController_1.createComment);
router.post("/attachment", auth_1.verifyToken, taskController_1.createAttachment);
exports.default = router;
