import { Router } from "express";
import * as commentController from "../controllers/comment.controller";
import validateUser from "../middleware/auth";

const router = Router();

router.post("/:id", validateUser, commentController.addComment);

export default router;
