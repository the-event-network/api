import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import ServerlessHttp from "serverless-http";
import categoryRoutes from "../routes/category.routes";
import commentRoutes from "../routes/comment.routes";
import eventRoutes from "../routes/event.routes";
import fileRoutes from "../routes/file.routes";
import userRoutes from "../routes/user.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/.netlify/functions/server/api/categories", categoryRoutes);
app.use("/.netlify/functions/server/api/comments", commentRoutes);
app.use("/.netlify/functions/server/api/events", eventRoutes);
app.use("/.netlify/functions/server/api/files", fileRoutes);
app.use("/.netlify/functions/server/api/users", userRoutes);

export const handler = ServerlessHttp(app);
