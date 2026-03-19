import { CommentDto } from "../interfaces/dto";
import { IComment } from "../interfaces/entities";

export function fromDtoToEntity(commentDto: CommentDto): Partial<IComment> {
  const { text } = commentDto;
  return { text };
}
