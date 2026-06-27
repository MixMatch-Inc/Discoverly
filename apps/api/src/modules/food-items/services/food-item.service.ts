import { AppError } from '../../../shared/errors/app-error.js';
import { foodItemRepository } from '../repositories/food-item.repository.js';
import type { CreateFoodItemInput, UpdateFoodItemInput } from '../types/food-item.types.js';

export const foodItemService = {
  async create(restaurantId: string, data: CreateFoodItemInput) {
    return foodItemRepository.create(restaurantId, data);
  },

  async getById(id: string) {
    const item = await foodItemRepository.findAvailableById(id);
    if (!item) throw AppError.notFound('Food item not found');
    return item;
  },

  async list(restaurantId: string, includeUnavailable: boolean, page: number, limit: number) {
    return foodItemRepository.listByRestaurant(restaurantId, includeUnavailable, page, limit);
  },

  async update(id: string, data: UpdateFoodItemInput) {
    const item = await foodItemRepository.findById(id);
    if (!item) throw AppError.notFound('Food item not found');
    return foodItemRepository.updateById(id, data);
  },

  async delete(id: string) {
    const item = await foodItemRepository.findById(id);
    if (!item) throw AppError.notFound('Food item not found');
    return foodItemRepository.softDelete(id);
  },
};
