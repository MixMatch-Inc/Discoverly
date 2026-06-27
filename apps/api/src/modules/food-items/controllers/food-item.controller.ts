import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../shared/errors/app-error.js';
import type { AuthenticatedRequest } from '../../../shared/types/express.js';
import { foodItemService } from '../services/food-item.service.js';
import { createFoodItemSchema, updateFoodItemSchema } from '../validators/food-item.validators.js';

export const foodItemController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const data = createFoodItemSchema.parse(req.body);
      const item = await foodItemService.create(req.params['restaurantId']!, req.user.id, data);
      res.status(201).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurantId = req.params['restaurantId']!;
      const includeUnavailable = req.query['includeUnavailable'] === 'true';
      const page = Math.max(1, Number(req.query['page']) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 20));
      const { docs, total } = await foodItemService.list(restaurantId, includeUnavailable, page, limit);
      res.status(200).json({ data: docs, meta: { page, limit, total } });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await foodItemService.getById(req.params['id']!);
      res.status(200).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const data = updateFoodItemSchema.parse(req.body);
      const item = await foodItemService.update(req.params['id']!, req.user.id, req.params['restaurantId']!, data);
      res.status(200).json({ data: item });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await foodItemService.delete(req.params['id']!, req.user.id, req.params['restaurantId']!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
