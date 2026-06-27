import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../../../shared/errors/app-error.js';
import { applyGeoFilter } from '../../../shared/query/geo-filter.js';
import { paginate } from '../../../shared/query/paginate.js';
import { applyTextSearch } from '../../../shared/query/text-search.js';
import type { AuthenticatedRequest } from '../../../shared/types/express.js';
import { RestaurantModel } from '../repositories/restaurant.model.js';
import { restaurantService } from '../services/restaurant.service.js';
import { createRestaurantSchema, updateRestaurantSchema } from '../validators/restaurant.validators.js';

export const restaurantController = {
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const data = createRestaurantSchema.parse(req.body);
      const restaurant = await restaurantService.create(req.user.id, data);
      res.status(201).json({ data: restaurant });
    } catch (error) {
      next(error);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = Math.max(1, Number(req.query['page']) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 20));

      let filter: Record<string, unknown> = { isActive: true };

      const cuisine = req.query['cuisine'] as string | undefined;
      if (cuisine) {
        const tags = cuisine.split(',').map((t) => t.trim()).filter(Boolean);
        if (tags.length) filter['cuisineTags'] = { $in: tags };
      }

      const { filter: searchFilter, scoreSort } = applyTextSearch(filter, req.query['q'] as string | undefined);
      filter = searchFilter;

      const lat = req.query['lat'] ? Number(req.query['lat']) : undefined;
      const lng = req.query['lng'] ? Number(req.query['lng']) : undefined;
      const radius = req.query['radius'] ? Number(req.query['radius']) : undefined;
      filter = applyGeoFilter(filter, { lat, lng, radius });

      const result = await paginate(RestaurantModel, filter, { page, limit }, { scoreSort });
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const restaurant = await restaurantService.getById(req.params['id']!);
      res.status(200).json({ data: restaurant });
    } catch (error) {
      next(error);
    }
  },

  async getOwn(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const restaurant = await restaurantService.getByOwner(req.user.id);
      res.status(200).json({ data: restaurant });
    } catch (error) {
      next(error);
    }
  },

  async update(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      const data = updateRestaurantSchema.parse(req.body);
      const restaurant = await restaurantService.update(req.params['id']!, req.user.id, data);
      res.status(200).json({ data: restaurant });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw AppError.unauthorized();
      await restaurantService.delete(req.params['id']!, req.user.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
