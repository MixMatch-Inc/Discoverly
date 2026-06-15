import type { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { userRepository } from '../../users/repositories/user.repository';
import { toAuthUser } from '../../users/services/user.service';
import { loginSchema, registerSchema } from '../validators/auth.validators';
import { NotFoundError, UnauthorizedError } from '../../../shared/errors/app-error';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = registerSchema.parse(req.body);
      const result = await authService.register(input);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = loginSchema.parse(req.body);
      const result = await authService.login(input);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new UnauthorizedError();
      }

      const user = await userRepository.findById(req.user.id);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      res.status(200).json({ user: toAuthUser(user) });
    } catch (error) {
      next(error);
    }
  },
};
