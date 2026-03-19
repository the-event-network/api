import { Router } from "express";
import * as categoryController from "../controllers/category.controller";

const router = Router();

router.get("/", categoryController.listCategories);
router.post("/", categoryController.createCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
