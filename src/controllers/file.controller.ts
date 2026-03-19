import { Request, Response } from "express";
import handleError from "../utils/handleError";
import * as fileService from "../services/file.service";

export async function uploadFile(req: Request, res: Response) {
  try {
    const url = await fileService.uploadFile(req.file);
    res.status(200).send({ imageUrl: url });
  } catch (err) {
    handleError(res, err);
  }
}
