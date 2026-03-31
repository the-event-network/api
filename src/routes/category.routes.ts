import { Router } from "express";
import * as categoryController from "../controllers/category.controller";
import validateUser from "../middleware/auth";

const router = Router();

router.get("/", categoryController.listCategories);
router.post("/", validateUser, categoryController.createCategory);
router.delete("/:id", validateUser, categoryController.deleteCategory);

export default router;
