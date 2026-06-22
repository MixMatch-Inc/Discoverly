import type { NextFunction, Request, Response } from 'express';
import { uploadImage } from './uploads.service.js';

export async function handleImageUpload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const folder = (req.query['folder'] as string | undefined) ?? 'general';
    const result = await uploadImage(req.file!.buffer, req.file!.originalname, folder);
    res.status(201).json({ data: result });
  } catch (error) {
    next(error);
  }
}
