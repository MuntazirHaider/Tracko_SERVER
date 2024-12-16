"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const roleBasedGuard_1 = require("../middleware/roleBasedGuard");
const router = (0, express_1.Router)();
router.get("/", auth_1.verifyToken, userController_1.getUsers);
router.get("/:username", auth_1.verifyToken, userController_1.getUserByUsername);
router.post("/", auth_1.verifyToken, (0, roleBasedGuard_1.roleBasedGuard)(['Admin', 'Project Manager']), userController_1.createUser);
router.put("/", auth_1.verifyToken, (0, roleBasedGuard_1.roleBasedGuard)(['Admin', 'Project Manager'], true), userController_1.updateUser);
router.patch("/", auth_1.verifyToken, userController_1.updateProfile);
exports.default = router;