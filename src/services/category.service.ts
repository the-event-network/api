import * as categoryRepository from "../repositories/category.repository";
import * as categoryMapper from "../mappers/category.mapper";

export async function listCategories() {
  return await categoryRepository.findAll();
}

export async function createNewCategory(name: string) {
  const category = categoryMapper.fromDtoToEntity({ name });
  return await categoryRepository.createOne(category);
}

export async function removeCategory(categoryId: string) {
  await categoryRepository.removeOneById(categoryId);
}
