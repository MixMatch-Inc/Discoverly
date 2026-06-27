import { FoodItemModel, type FoodItemDocument } from './food-item.model.js';
import type { CreateFoodItemInput, UpdateFoodItemInput } from '../types/food-item.types.js';

export const foodItemRepository = {
  async create(restaurantId: string, data: CreateFoodItemInput): Promise<FoodItemDocument> {
    return FoodItemModel.create({ ...data, restaurantId });
  },

  async findById(id: string): Promise<FoodItemDocument | null> {
    return FoodItemModel.findById(id);
  },

  async findAvailableById(id: string): Promise<FoodItemDocument | null> {
    return FoodItemModel.findOne({ _id: id, isAvailable: true });
  },

  async listByRestaurant(
    restaurantId: string,
    includeUnavailable: boolean,
    page: number,
    limit: number,
  ): Promise<{ docs: FoodItemDocument[]; total: number }> {
    const filter: Record<string, unknown> = { restaurantId };
    if (!includeUnavailable) filter['isAvailable'] = true;

    const [docs, total] = await Promise.all([
      FoodItemModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      FoodItemModel.countDocuments(filter),
    ]);
    return { docs, total };
  },

  async updateById(id: string, data: UpdateFoodItemInput): Promise<FoodItemDocument | null> {
    return FoodItemModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
  },

  async softDelete(id: string): Promise<FoodItemDocument | null> {
    return FoodItemModel.findByIdAndUpdate(id, { $set: { isAvailable: false } }, { new: true });
  },
};
