import { Router } from "express";
import * as fileController from "../controllers/file.controller";
import upload from "../middleware/uploadImage";

const router = Router();

router.post("/", upload.single("image"), fileController.uploadFile);

export default router;
