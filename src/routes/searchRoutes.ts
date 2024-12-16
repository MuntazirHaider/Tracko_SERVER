import { Router } from "express";
import { search } from "../controllers/searchController";
import { verifyToken } from "../middleware/auth";

const router = Router();

router.get("/", verifyToken, search);

export default router;