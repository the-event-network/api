import HttpError from "../interfaces/HttpError";
import * as fileRepository from "../repositories/file.repository";

export async function uploadFile(file: Express.Multer.File) {
  if (!file) throw new HttpError(404, "File not found");
  return await fileRepository.upload(file);
}
