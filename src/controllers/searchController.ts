import { Request, Response } from "express";
import { PrismaClient } from "../../prisma/generated/prisma-client-js";

const prisma = new PrismaClient();

export const search = async (
    req: Request,
    res: Response
): Promise<void> => {
    const { query } = req.query;

    try {
        const tasks = await prisma.task.findMany({
            where: {
                OR: [
                    { title: { contains: query as string, mode: 'insensitive' } },
                    { description: { contains: query as string, mode: 'insensitive' } },
                ]
            },
        });

        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { name: { contains: query as string, mode: 'insensitive' } },
                    { description: { contains: query as string, mode: 'insensitive' } },
                ]
            },
        });

        const users = await prisma.user.findMany({
            where: {
                OR: [{ username: { contains: query as string, mode: 'insensitive' } }],
            },
        });

        res.status(200).json({ tasks, projects, users });
    } catch (error: any) {
        res.status(500).json({ result: false, message: `Error performing search: ${error.message}` });
    }
};
