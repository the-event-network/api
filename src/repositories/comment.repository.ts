import { IComment } from "../interfaces/entities";
import { Comment } from "../models";

export async function findAll(query = {}, pagination = { skip: 0, limit: 20 }) {
  const { skip, limit } = pagination;
  const [data, total] = await Promise.all([
    Comment.find(query).skip(skip).limit(limit),
    Comment.countDocuments(query),
  ]);
  return { data, total };
}

export async function createOne(data: Partial<IComment>): Promise<IComment> {
  const comment = new Comment(data);
  await comment.populate({
    path: "user",
    model: "User",
    select: "-password -salt",
  });
  await comment.save();
  return comment;
}
