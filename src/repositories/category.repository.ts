import { ICategory } from "../interfaces/entities";
import Paginated from "../interfaces/Paginated";
import { Category } from "../models";

export async function findOne(name: string): Promise<ICategory | null> {
  return await Category.findOne({ name });
}

export async function findAll(
  query = {},
  pagination = { skip: 0, limit: 20 },
): Promise<Paginated<ICategory>> {
  const { skip, limit } = pagination;
  const [data, total] = await Promise.all([
    Category.find(query).skip(skip).limit(limit),
    Category.countDocuments(query),
  ]);
  return { data, total };
}

export async function createOne(
  category: Partial<ICategory>,
): Promise<ICategory> {
  const newCategory = new Category(category);
  await newCategory.save();
  return newCategory;
}

export async function removeOneById(id: string): Promise<void> {
  await Category.findByIdAndRemove(id);
}
