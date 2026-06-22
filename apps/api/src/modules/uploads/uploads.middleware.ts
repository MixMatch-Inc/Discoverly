import type { NextFunction, Request, Response } from 'express';
import multer from 'multer';
import { AppError } from '../../shared/errors/app-error.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter(_req, file, cb) {
    if ((ALLOWED_MIME_TYPES as readonly string[]).includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('Only JPEG, PNG, and WebP images are allowed', 400));
    }
  },
});

export const uploadSingleImage = upload.single('image');

export function requireImageUpload(req: Request, _res: Response, next: NextFunction): void {
  if (!req.file) {
    next(AppError.badRequest('An image file is required'));
    return;
  }
  next();
}
