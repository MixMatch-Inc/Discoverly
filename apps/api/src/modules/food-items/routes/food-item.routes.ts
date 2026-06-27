import { Router } from 'express';
import { authenticate } from '../../auth/middleware/authenticate.js';
import { foodItemController } from '../controllers/food-item.controller.js';

export const foodItemRouter = Router({ mergeParams: true });

foodItemRouter.post('/', authenticate, foodItemController.create);
foodItemRouter.get('/', foodItemController.list);
foodItemRouter.get('/:id', foodItemController.getById);
foodItemRouter.patch('/:id', authenticate, foodItemController.update);
foodItemRouter.delete('/:id', authenticate, foodItemController.delete);
