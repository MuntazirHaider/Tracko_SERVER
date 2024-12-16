import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "../../prisma/generated/prisma-client-js";

const prisma = new PrismaClient();

export const getUsers = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const organizationId = Number(req.user?.organizationId);

        const users = await prisma.user.findMany({
            where: {
                organizationId
            },select:{
                userId: true,
                username: true,
                role: true,
                organizationId: true,
                profilePictureUrl: true
            }
        });
        res.status(201).json(users);
    } catch (error: any) {
        res.status(500).json({ result: false, message: `Error retrieving users ${error.message}` });
    }
}

export const getUserByUsername = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const username = req.params.username?.toString();
        
        const user = await prisma.user.findUnique({
            where: {
                username,
            },
            include: {
                organization: true,
            }
        });
        delete (user as any).password;
        res.status(201).json(user);
    } catch (error: any) {
        res.status(500).json({ result: false, message: `Error retrieving users ${error.message}` });
    }
}

export const createUser = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { organizationId, profilePictureUrl, role, username, password } = req.body;
    try {
        if (!organizationId || !role || !username || !password) {
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
                role,
                organizationId,
                profilePictureUrl: profilePictureUrl || null
            }
        });

        return res.status(200).json(newUser);
    } catch (error: any) {
        return res.status(500).json({ result: false, message: `Error creating user: ${error.message}` });
    }
}

export const updateUser = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { userId, profilePictureUrl, role, username, password } = req.body;
    try {
        if (!userId || !role || !username) {
            return res.status(400).json({ result: false, message: 'Please provide all mandatory fields' });
        }
        const user = await prisma.user.findUnique({
            where: {
                userId
            }
        });

        if (!user) {
            return res.status(400).json({ result: false, message: "User with this username not exist" });
        }
        if (username && username.length < 2) {
            return res.status(400).json({ result: false, message: "Username length must be greater than or equal to two" });
        }
        if (password && password.length < 6) {
            return res.status(400).json({ result: false, message: "Password length must be greater than or equal to six" });
        }

        let hashPassword;
        if (password) {
            const salt = await bcrypt.genSalt();
            hashPassword = await bcrypt.hash(password, salt);
        }

        let updatedUser;
        if (password) {
            updatedUser = await prisma.user.update({
                where: {
                    userId
                },
                data: {
                    username,
                    role: user.role === 'Admin' ? user.role : role,
                    profilePictureUrl,
                    password: hashPassword
                }
            });
        } else {
            updatedUser = await prisma.user.update({
                where: {
                    userId
                },
                data: {
                    username,
                    role: user.role === 'Admin' ? user.role : role,
                    profilePictureUrl,
                }
            });
        }

        return res.status(200).json(updatedUser);
    } catch (error: any) {
        return res.status(500).json({ result: false, message: `Error registering user and organization: ${error.message}` });
    }
}

export const updateProfile = async (
    req: Request,
    res: Response
): Promise<any> => {
    const { userId, profilePictureUrl, password } = req.body;
    try {
        if (!userId || (!profilePictureUrl && !password)) {
            return res.status(400).send('Please provide all mandatory fields');
        }
        const user = await prisma.user.findUnique({
            where: {
                userId
            }
        });

        if (!user) {
            return res.status(400).json({ result: false, message: "User with this username not exist" });
        }

        if (password && (password.length < 6 || password.length > 12)) {
            return res.status(400).json({ result: false, message: "Password length must be between 6 to 12 characters long" });
        }

        let hashPassword;
        if (password) {
            const salt = await bcrypt.genSalt();
            hashPassword = await bcrypt.hash(password, salt);
        }

        let newUser;
        if (password) {
            newUser = await prisma.user.update({
                where: {
                    userId
                },
                data: {
                    profilePictureUrl,
                    password: hashPassword
                }
            });
        } else {
            newUser = await prisma.user.update({
                where: {
                    userId
                },
                data: {
                    profilePictureUrl,
                }
            });
        }

        return res.status(200).json(newUser);
    } catch (error: any) {
        return res.status(500).json({ result: false, message: `Error in updating profile: ${error.message}` });
    }
}