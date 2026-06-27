import type { Express } from 'express';
import request from 'supertest';

const BASE_PAYLOAD = {
  name: 'Mama Nkechi Kitchen',
  description: 'Authentic home-style cooking',
  address: { city: 'Abuja', country: 'Nigeria' },
  cuisineTags: ['mediterranean'],
};

export async function seedRestaurant(app: Express, token: string, overrides?: Record<string, unknown>) {
  const res = await request(app)
    .post('/api/restaurants')
    .set('Authorization', `Bearer ${token}`)
    .send({ ...BASE_PAYLOAD, ...overrides });
  return res.body.data;
}
