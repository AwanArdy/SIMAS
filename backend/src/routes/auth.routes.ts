import { Router } from "express";
import { login, getMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/me
router.get('/me', requireAuth, getMe);

export default router;
