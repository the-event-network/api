import { Router } from "express";
import eventRoutes from "./event.routes";
import userRoutes from "./user.routes";
import commentRoutes from "./comment.routes";
import fileRoutes from "./file.routes";
import categoryRoutes from "./category.routes";

const router = Router();

router.use("/events", eventRoutes);
router.use("/users", userRoutes);
router.use("/comments", commentRoutes);
router.use("/files", fileRoutes);
router.use("/categories", categoryRoutes);

export default router;
