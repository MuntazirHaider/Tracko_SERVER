import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { PrismaClient } from "../../prisma/generated/prisma-client-js";

const prisma = new PrismaClient();

export const signup = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { organizationName, established, industry, username, password } = req.body;
    try {
        if (!organizationName || !established || !industry || !username || !password) {
            return res.status(400).json({ result: false, message: 'Please provide all mandatory fields' });
        }

        const user = await prisma.user.findUnique({
            where: {
                username: username,
            }
        });

        if (user) {
            return res.status(400).json({ result: false, message: "User with this username already exists" });
        }
        if (username.length < 2) {
            return res.status(400).json({ result: false, message: "Username length must be greater than or equal to two" });
        }
        if (password.length < 6) {
            return res.status(400).json({ result: false, message: "Password length must be greater than or equal to six" });
        }

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        let newUser = await prisma.user.create({
            data: {
                username,
                password: hashPassword,
                role: 'Admin',
            }
        });

        const newOrganization = await prisma.organization.create({
            data: {
                name: organizationName,
                established,
                industry,
                ownerId: newUser.userId,
            }
        });

        newUser = await prisma.user.update({
            where: {
                userId: newUser.userId
            },
            data: {
                organizationId: newOrganization.id,
            }
        });

        return res.status(200).json({ result: true, data: [newUser, newOrganization] });
    } catch (error: any) {
        return res.status(500).json({ result: false, message: `Error registering user and organization: ${error.message}` });
    }
}

export const signin = async (
    req: Request,
    res: Response
): Promise<any> => {
    try {
        const { username, password } = req.body;

        if (!username || !password) return res.status(400).json({ result: false, message: 'Please provide all mandatory fields' });

        const user = await prisma.user.findUnique({
            where: {
                username: username,
            },
            include: {
                organization: true,
            }
        });

        if (!user) return res.status(400).json({ result: false, message: "User with this credentials not exist" });

        const isPassMatch = await bcrypt.compare(password, user.password);
        if (!isPassMatch) return res.status(400).json({ result: false, message: "Invalid Credentials" });

        const token = jwt.sign({
            id: user.userId,
            organizationId: user.organization?.id
        }, process.env.JWT_SECRET as string);

        delete (user as any).password;

        res.status(201).json({ result: true, data: [token, user] });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
