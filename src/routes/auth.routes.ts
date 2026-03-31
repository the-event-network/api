import { Router } from "express";
import rateLimit from "express-rate-limit";
import * as userController from "../controllers/user.controller";

const router = Router();

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post("/login", loginLimiter, userController.login);
router.post("/signup", userController.signup);

export default router;
