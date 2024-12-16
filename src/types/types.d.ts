import { JwtPayload } from "jsonwebtoken";
import { Request } from "express";

export interface UserPayload extends JwtPayload {
    id?: string | JwtPayload;
    organizationId?: string | JwtPayload;
}

declare module "express-serve-static-core" {
    interface Request {
        user?: UserPayload;
    }
}
