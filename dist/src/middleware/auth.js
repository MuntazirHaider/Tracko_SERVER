"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    try {
        let token = req.header("Authorization");
        if (!token) {
            return res.status(403).send("Access Denied: No token provided");
        }
        if (!token.includes("Bearer ")) {
            return res.status(401).send("Invalid Token Format");
        }
        const extractedToken = token.replace(/Bearer\s/, '');
        const verified = jsonwebtoken_1.default.verify(extractedToken, process.env.JWT_SECRET);
        req.user = {
            id: verified.id,
            organizationId: verified.organizationId,
        };
        next();
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).send("Token Expired");
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(401).send("Invalid Token");
        }
        res.status(500).json({ error: error.message });
    }
};
exports.verifyToken = verifyToken;
