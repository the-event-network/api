import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { IUser } from "../interfaces/entities";
dotenv.config();

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET environment variable is required");

const generateToken = (payload: Partial<IUser>) => {
  const token = jwt.sign({ payload }, secret, {
    expiresIn: "2h",
  });
  return token;
};

const validateToken = (token: string = "") => {
  return jwt.verify(token, secret);
};

export { generateToken, validateToken };
