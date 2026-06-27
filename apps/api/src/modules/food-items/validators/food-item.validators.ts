import { z } from 'zod';

export const createFoodItemSchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional(),
  price: z.number().int().positive(),
  category: z.string().trim().min(1).max(50),
  dietaryTags: z.array(z.string()).max(10).optional(),
  imageUrls: z.array(z.string().url()).max(5).optional(),
});

export const updateFoodItemSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  description: z.string().trim().max(300).optional(),
  price: z.number().int().positive().optional(),
  category: z.string().trim().min(1).max(50).optional(),
  dietaryTags: z.array(z.string()).max(10).optional(),
  imageUrls: z.array(z.string().url()).max(5).optional(),
});
