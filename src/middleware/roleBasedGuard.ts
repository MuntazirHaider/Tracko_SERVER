import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from "../../prisma/generated/prisma-client-js";
import { cache } from '../utils/cache';

const prisma = new PrismaClient();

export const roleBasedGuard = (allowedRoles: string[], isRoleChanged?: boolean) => {
    return async (req: Request, res: any, next: NextFunction) => { 
        const id = req.user?.id;
        if (!id) {
            return res.status(403).json({ result: false, message: "Please Login again then try" });
        }

        try {
            if(!cache.get(Number(id)) || isRoleChanged){
                const user = await prisma.user.findUnique({
                    where: {
                        userId: Number(id),
                    },
                    select: {
                        role: true,
                    },
                });

                if(user){
                    cache.set(Number(id), user.role);
                }
            }

            const userRole = cache.get(Number(id));
            if (!userRole || !allowedRoles.includes(userRole.toString())) {
                return res.status(403).json({
                    result: false,
                    message: "Access Denied: You don't have permission to access this route",
                });
            }

            next();
        } catch (error) {
            return res.status(500).json({ result: false, message: "Internal Server Error" });
        }
    };
};

