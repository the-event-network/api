import { Request, Response } from "express";
import handleError from "../utils/handleError";
import * as commentService from "../services/comment.service";

export async function addComment(req: Request, res: Response) {
  try {
    const comment = await commentService.addComment(
      req.params.id,
      req.user._id,
      req.body.text,
    );
    res.status(200).send(comment);
  } catch (err) {
    handleError(res, err);
  }
}
