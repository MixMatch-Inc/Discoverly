import { z } from 'zod';
import { CUISINE_TAGS, DIETARY_TAGS } from '../types/tags';

export const cuisineTagSchema = z.string().refine(
  (val) => CUISINE_TAGS.includes(val),
  { message: 'Invalid cuisine tag' },
);

export const dietaryTagSchema = z.string().refine(
  (val) => DIETARY_TAGS.includes(val),
  { message: 'Invalid dietary tag' },
);
