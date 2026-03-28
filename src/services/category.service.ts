import * as categoryRepository from "../repositories/category.repository";
import * as categoryMapper from "../mappers/category.mapper";
import { getOrSet, del } from "../cache";

const CATEGORIES_KEY = "categories:all";
const CATEGORIES_TTL = 600;

export async function listCategories() {
  return getOrSet(CATEGORIES_KEY, CATEGORIES_TTL, () =>
    categoryRepository.findAll(),
  );
}

export async function createNewCategory(name: string) {
  const category = categoryMapper.fromDtoToEntity({ name });
  const result = await categoryRepository.createOne(category);
  await del(CATEGORIES_KEY);
  return result;
}

export async function removeCategory(categoryId: string) {
  await categoryRepository.removeOneById(categoryId);
  await del(CATEGORIES_KEY);
}
