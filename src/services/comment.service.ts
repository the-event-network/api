import HttpError from "../interfaces/HttpError";
import * as commentMapper from "../mappers/comment.mapper";
import * as commentRepository from "../repositories/comment.repository";
import * as eventRepository from "../repositories/event.repository";
import * as userRepository from "../repositories/user.repository";

export async function addComment(
  eventId: string,
  userId: string,
  text: string,
) {
  const comment = commentMapper.fromDtoToEntity({ userId, text, eventId });

  const event = await eventRepository.findOneById(eventId);
  if (!event) throw new HttpError(404, "Event not found");
  comment.event = event;

  const user = await userRepository.findOneById(userId);
  if (!user) throw new HttpError(404, "User not found");
  comment.user = user;

  const newComment = await commentRepository.createOne(comment);

  await eventRepository.updateOneById(eventId, {
    comments: [...event.comments, newComment],
  });

  return newComment;
}
