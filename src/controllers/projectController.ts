import { Request, Response } from "express";
import { PrismaClient } from "../../prisma/generated/prisma-client-js";

const prisma = new PrismaClient();

export const getProjects = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {
        const projects = await prisma.project.findMany({
            where: {
                organizationId: Number(req.user?.organizationId)
            }
        });
        res.status(201).json(projects);
    } catch (error: any) {
        res.status(500).json({ result: false, message: `Error retrieving projects ${error.message}` });
    }
}

export const createProjects = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { name, description, startDate, endDate } = req.body;
    const organizationId = req.user?.organizationId;
    if(!name || !organizationId) res.status(404).json({ result: false, message: "Please provide all mandatory fields"});
    if(startDate && endDate && new Date(startDate) > new Date(endDate)) res.status(404).json({ result: false, message: "Start date must be before end date" });
    try {
        const newProject = await prisma.project.create({
            data: {
                name,
                description,
                startDate,
                endDate,
                organizationId: Number(organizationId)
            }
        })
        res.status(201).json(newProject);
    } catch (error: any) {
        res.status(500).json({ result: false, message: `Error creating projects ${error.message}` });
    }
}