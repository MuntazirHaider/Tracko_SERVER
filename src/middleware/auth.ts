import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from "express";
import { UserPayload } from '../types/types';

export const verifyToken = (req: Request, res: any, next: NextFunction) => {
    try {
        let token = req.header("Authorization");

        if (!token) {
            return res.status(403).send("Access Denied: No token provided");
        }

        if (!token.includes("Bearer ")) {
            return res.status(401).send("Invalid Token Format");
        }

        const extractedToken = token.replace(/Bearer\s/, '');

        const verified = jwt.verify(extractedToken, process.env.JWT_SECRET as string) as UserPayload;
        req.user = {
            id: verified.id,
            organizationId: verified.organizationId,
        };
        next();

    } catch (error: any) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).send("Token Expired");
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).send("Invalid Token");
        }
        res.status(500).json({ error: error.message });
    }
};
