import { Router } from "express";
import * as fileController from "../controllers/file.controller";
import upload from "../middleware/uploadImage";
import validateUser from "../middleware/auth";

const router = Router();

router.post("/", validateUser, upload.single("image"), fileController.uploadFile);

export default router;
