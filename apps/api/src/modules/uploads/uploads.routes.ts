import { Router } from 'express';
import { authenticate } from '../auth/middleware/authenticate.js';
import { handleImageUpload } from './uploads.controller.js';
import { requireImageUpload, uploadSingleImage } from './uploads.middleware.js';

export const uploadsRouter = Router();

uploadsRouter.post('/', authenticate, uploadSingleImage, requireImageUpload, handleImageUpload);
