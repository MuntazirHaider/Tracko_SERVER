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
exports.createProjects = exports.getProjects = void 0;
const prisma_client_js_1 = require("../../prisma/generated/prisma-client-js");
const prisma = new prisma_client_js_1.PrismaClient();
const getProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const projects = yield prisma.project.findMany({
            where: {
                organizationId: Number((_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId)
            }
        });
        res.status(201).json(projects);
    }
    catch (error) {
        res.status(500).json({ result: false, message: `Error retrieving projects ${error.message}` });
    }
});
exports.getProjects = getProjects;
const createProjects = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { name, description, startDate, endDate } = req.body;
    const organizationId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.organizationId;
    if (!name || !organizationId)
        res.status(404).json({ result: false, message: "Please provide all mandatory fields" });
    if (startDate && endDate && new Date(startDate) > new Date(endDate))
        res.status(404).json({ result: false, message: "Start date must be before end date" });
    try {
        const newProject = yield prisma.project.create({
            data: {
                name,
                description,
                startDate,
                endDate,
                organizationId: Number(organizationId)
            }
        });
        res.status(201).json(newProject);
    }
    catch (error) {
        res.status(500).json({ result: false, message: `Error creating projects ${error.message}` });
    }
});
exports.createProjects = createProjects;
