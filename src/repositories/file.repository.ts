import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

export async function upload(file: Express.Multer.File): Promise<string> {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const uploadResult = await cloudinary.uploader.upload(
    `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
  );
  return uploadResult.secure_url;
}
