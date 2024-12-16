import { Request, Response } from "express";
import { PrismaClient } from "../../prisma/generated/prisma-client-js";

const prisma = new PrismaClient();

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  const projectId = Number(req.query.projectId);
  try {
    const tasks = await prisma.task.findMany({
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
  } catch (error: any) {
    res.status(500).json({
      result: false,
      message: `Error retrieving tasks ${error.message}`,
    });
  }
};

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
    assignedUserId,
  } = req.body;
  if (!projectId || !title || !authorUserId) {
    res.status(400).json({ result: false, message: "Please provide all mandatory fields" });
  }
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
        assignedUserId,
      },
    });
    res.status(201).json(newTask);
  } catch (error: any) {
    res
      .status(500)
      .json({ result: false, message: `Error creating task ${error.message}` });
  }
};

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
          status: status,
      },
    });
    res.status(201).json(updatedTask);
  } catch (error: any) {
    res.status(500).json({
        result: false,
      message: `Error updating tasks ${error.message}`,
    });
  }
};

export const getUserTasks = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
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
} catch (error: any) {
    res
      .status(500)
      .json({ message: `Error retrieving user's tasks: ${error.message}` });
    }
};

export const deleteTask = async (
  req: Request,
  res: Response
): Promise<void> => {
    const { taskId } = req.params;
    try {
        const deletedTask = await prisma.task.delete({
            where: {
        id: Number(taskId),
    },
});
res.status(201).json(deletedTask);
} catch (error: any) {
    res.status(500).json({
      result: false,
      message: `Error deleting tasks ${error.message}`,
    });
}
};

export const createComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    newComment,
    taskId,
    userId
  } = req.body;
  try {
    const createdComment = await prisma.comment.create({
      data: {
        text: newComment,
        taskId,
        userId,
      },
    });
    res.status(201).json(createdComment);
  } catch (error: any) {
    res
      .status(500)
      .json({ result: false, message: `Error creating comment ${error.message}` });
  }
};

export const createAttachment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const {
    fileURL,
    taskId,
    userId
  } = req.body;
  try {
    const createdAttachment = await prisma.attachment.create({
      data: {
        fileURL,
        taskId,
        uploadedById: userId
      },
    });
    res.status(201).json(createdAttachment);
  } catch (error: any) {
    res
      .status(500)
      .json({ result: false, message: `Error creating attachment ${error.message}` });
  }
};