import { CategoryDto } from "../interfaces/dto";
import { ICategory } from "../interfaces/entities";

export function fromDtoToEntity(categoryDto: CategoryDto): Partial<ICategory> {
  const { name } = categoryDto;
  return { name };
}

export function fromEntitiesToArray(entities: ICategory[]) {
  return entities.map(({ _id }) => _id);
}
