import type { Express } from 'express';
import request from 'supertest';

const BASE_PAYLOAD = {
  name: 'Jollof Rice',
  description: 'West African classic',
  price: 2500,
  category: 'main',
  dietaryTags: ['halal'],
};

export async function seedFoodItem(
  app: Express,
  token: string,
  restaurantId: string,
  overrides?: Record<string, unknown>,
) {
  const res = await request(app)
    .post(`/api/restaurants/${restaurantId}/food-items`)
    .set('Authorization', `Bearer ${token}`)
    .send({ ...BASE_PAYLOAD, ...overrides });
  return res.body.data;
}
