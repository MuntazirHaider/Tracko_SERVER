"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAttachment = exports.createComment = exports.deleteTask = exports.getUserTasks = exports.updateTaskStatus = exports.createTask = exports.getTasks = void 0;
const prisma_client_js_1 = require("../../prisma/generated/prisma-client-js");
const prisma = new prisma_client_js_1.PrismaClient();
const getTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const projectId = Number(req.query.projectId);
    try {
        const tasks = yield prisma.task.findMany({
            where: {
                projectId,
            },
            include: {
                author: {
                    select: {
                        userId: true,
                        username: true,
                        role: true,
                        profilePictureUrl: true,
                        organizationId: true,
                    },
                },
                assignee: {
                    select: {
                        userId: true,
                        username: true,
                        role: true,
                        profilePictureUrl: true,
                        organizationId: true,
                    },
                },
                comments: {
                    select: {
                        id: true,
                        text: true,
                        user: {
                            select: {
                                username: true,
                                profilePictureUrl: true,
                            },
                        },
                    },
                },
                attachments: true,
            },
        });
        res.status(201).json(tasks);
    }
    catch (error) {
        res.status(500).json({
            result: false,
            message: `Error retrieving tasks ${error.message}`,
        });
    }
});
exports.getTasks = getTasks;
const createTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { projectId, title, description, status, priority, tags, startDate, dueDate, points, authorUserId, assignedUserId, } = req.body;
    if (!projectId || !title || !authorUserId) {
        res.status(400).json({ result: false, message: "Please provide all mandatory fields" });
    }
    try {
        const newTask = yield prisma.task.create({
            data: {
                projectId,
                title,
                description,
                status,
                priority,
                tags,
                startDate,
                dueDate,
                points,
                authorUserId,
                assignedUserId,
            },
        });
        res.status(201).json(newTask);
    }
    catch (error) {
        res
            .status(500)
            .json({ result: false, message: `Error creating task ${error.message}` });
    }
});
exports.createTask = createTask;
const updateTaskStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    const { status } = req.body;
    try {
        const updatedTask = yield prisma.task.update({
            where: {
                id: Number(taskId),
            },
            data: {
                status: status,
            },
        });
        res.status(201).json(updatedTask);
    }
    catch (error) {
        res.status(500).json({
            result: false,
            message: `Error updating tasks ${error.message}`,
        });
    }
});
exports.updateTaskStatus = updateTaskStatus;
const getUserTasks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const tasks = yield prisma.task.findMany({
            where: {
                OR: [
                    { authorUserId: Number(userId) },
                    { assignedUserId: Number(userId) },
                ],
            },
            include: {
                author: {
                    select: {
                        userId: true,
                        username: true,
                        role: true,
                        profilePictureUrl: true,
                        organizationId: true,
                    },
                },
                assignee: {
                    select: {
                        userId: true,
                        username: true,
                        role: true,
                        profilePictureUrl: true,
                        organizationId: true,
                    },
                },
            },
        });
        res.json(tasks);
    }
    catch (error) {
        res
            .status(500)
            .json({ message: `Error retrieving user's tasks: ${error.message}` });
    }
});
exports.getUserTasks = getUserTasks;
const deleteTask = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { taskId } = req.params;
    try {
        const deletedTask = yield prisma.task.delete({
            where: {
                id: Number(taskId),
            },
        });
        res.status(201).json(deletedTask);
    }
    catch (error) {
        res.status(500).json({
            result: false,
            message: `Error deleting tasks ${error.message}`,
        });
    }
});
exports.deleteTask = deleteTask;
const createComment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newComment, taskId, userId } = req.body;
    try {
        const createdComment = yield prisma.comment.create({
            data: {
                text: newComment,
                taskId,
                userId,
            },
        });
        res.status(201).json(createdComment);
    }
    catch (error) {
        res
            .status(500)
            .json({ result: false, message: `Error creating comment ${error.message}` });
    }
});
exports.createComment = createComment;
const createAttachment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { fileURL, taskId, userId } = req.body;
    try {
        const createdAttachment = yield prisma.attachment.create({
            data: {
                fileURL,
                taskId,
                uploadedById: userId
            },
        });
        res.status(201).json(createdAttachment);
    }
    catch (error) {
        res
            .status(500)
            .json({ result: false, message: `Error creating attachment ${error.message}` });
    }
});
exports.createAttachment = createAttachment;
