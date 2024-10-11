import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { projectId } = req.query;
    try {
        const tasks = await prisma.task.findMany({
            where: {
                projectId: Number(projectId),
            },
            include: {
                author: true,
                assignee: true,
                comments: true,
                attachments: true
            }
        });
        res.status(201).json({ result: true, data: tasks });
    } catch (error: any) {
        res.status(500).json({ result: false, message: `Error retrieving tasks ${error.message}` });
    }
}

export const createTask = async (
    req: Request,
    res: Response
): Promise<void> => {
    const {
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
        assignedUserId
    } = req.body;
    try {
        const newTask = await prisma.task.create({
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
                assignedUserId
            },
        })
        res.status(201).json({ result: true, data: newTask });
    } catch (error: any) {
        res.status(500).json({ result: false, message: `Error creating task ${error.message}` });
    }
}

export const updateTaskStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { taskId } = req.params;
    const { status } = req.body;
    try {
        const updatedTask = await prisma.task.update({
            where: {
                id: Number(taskId),
            },
            data: {
                status: status
            }
        });
        res.status(201).json({ result: true, data: updatedTask });
    } catch (error: any) {
        res.status(500).json({ result: false, message: `Error updating tasks ${error.message}` });
    }
}