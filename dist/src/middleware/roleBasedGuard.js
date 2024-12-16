"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleBasedGuard = void 0;
const prisma_client_js_1 = require("../../prisma/generated/prisma-client-js");
const cache_1 = require("../utils/cache");
const prisma = new prisma_client_js_1.PrismaClient();
const roleBasedGuard = (allowedRoles, isRoleChanged) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!id) {
            return res.status(403).json({ result: false, message: "Please Login again then try" });
        }
        try {
            if (!cache_1.cache.get(Number(id)) || isRoleChanged) {
                const user = yield prisma.user.findUnique({
                    where: {
                        userId: Number(id),
                    },
                    select: {
                        role: true,
                    },
                });
                if (user) {
                    cache_1.cache.set(Number(id), user.role);
                }
            }
            const userRole = cache_1.cache.get(Number(id));
            if (!userRole || !allowedRoles.includes(userRole.toString())) {
                return res.status(403).json({
                    result: false,
                    message: "Access Denied: You don't have permission to access this route",
                });
            }
            next();
        }
        catch (error) {
            return res.status(500).json({ result: false, message: "Internal Server Error" });
        }
    });
};
exports.roleBasedGuard = roleBasedGuard;
