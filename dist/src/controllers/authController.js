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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_client_js_1 = require("../../prisma/generated/prisma-client-js");
const prisma = new prisma_client_js_1.PrismaClient();
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizationName, established, industry, username, password } = req.body;
    try {
        if (!organizationName || !established || !industry || !username || !password) {
            return res.status(400).json({ result: false, message: 'Please provide all mandatory fields' });
        }
        const user = yield prisma.user.findUnique({
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
        const salt = yield bcrypt_1.default.genSalt();
        const hashPassword = yield bcrypt_1.default.hash(password, salt);
        let newUser = yield prisma.user.create({
            data: {
                username,
                password: hashPassword,
                role: 'Admin',
            }
        });
        const newOrganization = yield prisma.organization.create({
            data: {
                name: organizationName,
                established,
                industry,
                ownerId: newUser.userId,
            }
        });
        newUser = yield prisma.user.update({
            where: {
                userId: newUser.userId
            },
            data: {
                organizationId: newOrganization.id,
            }
        });
        return res.status(200).json({ result: true, data: [newUser, newOrganization] });
    }
    catch (error) {
        return res.status(500).json({ result: false, message: `Error registering user and organization: ${error.message}` });
    }
});
exports.signup = signup;
const signin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ result: false, message: 'Please provide all mandatory fields' });
        const user = yield prisma.user.findUnique({
            where: {
                username: username,
            },
            include: {
                organization: true,
            }
        });
        if (!user)
            return res.status(400).json({ result: false, message: "User with this credentials not exist" });
        const isPassMatch = yield bcrypt_1.default.compare(password, user.password);
        if (!isPassMatch)
            return res.status(400).json({ result: false, message: "Invalid Credentials" });
        const token = jsonwebtoken_1.default.sign({
            id: user.userId,
            organizationId: (_a = user.organization) === null || _a === void 0 ? void 0 : _a.id
        }, process.env.JWT_SECRET);
        delete user.password;
        res.status(201).json({ result: true, data: [token, user] });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
exports.signin = signin;
