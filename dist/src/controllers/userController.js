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
exports.updateProfile = exports.updateUser = exports.createUser = exports.getUserByUsername = exports.getUsers = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_client_js_1 = require("../../prisma/generated/prisma-client-js");
const prisma = new prisma_client_js_1.PrismaClient();
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const organizationId = Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId);
        const users = yield prisma.user.findMany({
            where: {
                organizationId
            }, select: {
                userId: true,
                username: true,
                role: true,
                organizationId: true,
                profilePictureUrl: true
            }
        });
        res.status(201).json(users);
    }
    catch (error) {
        res.status(500).json({ result: false, message: `Error retrieving users ${error.message}` });
    }
});
exports.getUsers = getUsers;
const getUserByUsername = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const username = (_a = req.params.username) === null || _a === void 0 ? void 0 : _a.toString();
        const user = yield prisma.user.findUnique({
            where: {
                username,
            },
            include: {
                organization: true,
            }
        });
        delete user.password;
        res.status(201).json(user);
    }
    catch (error) {
        res.status(500).json({ result: false, message: `Error retrieving users ${error.message}` });
    }
});
exports.getUserByUsername = getUserByUsername;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { organizationId, profilePictureUrl, role, username, password } = req.body;
    try {
        if (!organizationId || !role || !username || !password) {
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
                role,
                organizationId,
                profilePictureUrl: profilePictureUrl || null
            }
        });
        return res.status(200).json(newUser);
    }
    catch (error) {
        return res.status(500).json({ result: false, message: `Error creating user: ${error.message}` });
    }
});
exports.createUser = createUser;
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, profilePictureUrl, role, username, password } = req.body;
    try {
        if (!userId || !role || !username) {
            return res.status(400).json({ result: false, message: 'Please provide all mandatory fields' });
        }
        const user = yield prisma.user.findUnique({
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
            const salt = yield bcrypt_1.default.genSalt();
            hashPassword = yield bcrypt_1.default.hash(password, salt);
        }
        let updatedUser;
        if (password) {
            updatedUser = yield prisma.user.update({
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
        }
        else {
            updatedUser = yield prisma.user.update({
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
    }
    catch (error) {
        return res.status(500).json({ result: false, message: `Error registering user and organization: ${error.message}` });
    }
});
exports.updateUser = updateUser;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, profilePictureUrl, password } = req.body;
    try {
        if (!userId || (!profilePictureUrl && !password)) {
            return res.status(400).send('Please provide all mandatory fields');
        }
        const user = yield prisma.user.findUnique({
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
            const salt = yield bcrypt_1.default.genSalt();
            hashPassword = yield bcrypt_1.default.hash(password, salt);
        }
        let newUser;
        if (password) {
            newUser = yield prisma.user.update({
                where: {
                    userId
                },
                data: {
                    profilePictureUrl,
                    password: hashPassword
                }
            });
        }
        else {
            newUser = yield prisma.user.update({
                where: {
                    userId
                },
                data: {
                    profilePictureUrl,
                }
            });
        }
        return res.status(200).json(newUser);
    }
    catch (error) {
        return res.status(500).json({ result: false, message: `Error in updating profile: ${error.message}` });
    }
});
exports.updateProfile = updateProfile;
