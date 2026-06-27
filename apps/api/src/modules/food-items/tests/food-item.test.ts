import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../../app.js';
import { seedFoodItem } from '../../../tests/helpers/create-food-item.js';
import { seedRestaurant } from '../../../tests/helpers/create-restaurant.js';
import { seedUser } from '../../../tests/helpers/create-user.js';

let mongo: MongoMemoryServer;
const app = createApp();

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

async function buildOwnerAndRestaurant() {
  const owner = await seedUser(app);
  const restaurant = await seedRestaurant(app, owner.token);
  return { owner, restaurant };
}

describe('POST /api/restaurants/:restaurantId/food-items', () => {
  it('should allow the owner to create a food item', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();

    const res = await request(app)
      .post(`/api/restaurants/${restaurant._id}/food-items`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Pounded Yam', price: 3500, category: 'main' });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Pounded Yam', price: 3500 });
    expect(res.body.data.restaurantId).toBe(restaurant._id);
  });

  it('should reject creation by a non-owner with 403', async () => {
    const { restaurant } = await buildOwnerAndRestaurant();
    const intruder = await seedUser(app);

    const res = await request(app)
      .post(`/api/restaurants/${restaurant._id}/food-items`)
      .set('Authorization', `Bearer ${intruder.token}`)
      .send({ name: 'Nope', price: 1000, category: 'starter' });

    expect(res.status).toBe(403);
  });

  it('should reject unauthenticated requests with 401', async () => {
    const { restaurant } = await buildOwnerAndRestaurant();

    const res = await request(app)
      .post(`/api/restaurants/${restaurant._id}/food-items`)
      .send({ name: 'Nope', price: 1000, category: 'starter' });

    expect(res.status).toBe(401);
  });

  it('should return 400 for missing required fields', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();

    const res = await request(app)
      .post(`/api/restaurants/${restaurant._id}/food-items`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ category: 'drink' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should return 400 for an invalid dietary tag', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();

    const res = await request(app)
      .post(`/api/restaurants/${restaurant._id}/food-items`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Bowl', price: 900, category: 'main', dietaryTags: ['made-up'] });

    expect(res.status).toBe(400);
  });

  it('should return 404 for a nonexistent restaurant', async () => {
    const { owner } = await buildOwnerAndRestaurant();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/api/restaurants/${fakeId}/food-items`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Phantom', price: 500, category: 'dessert' });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/restaurants/:restaurantId/food-items', () => {
  it('should only return available items on public requests', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    await seedFoodItem(app, owner.token, restaurant._id, { name: 'Visible' });
    const hidden = await seedFoodItem(app, owner.token, restaurant._id, { name: 'Hidden' });

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${hidden._id}`)
      .set('Authorization', `Bearer ${owner.token}`);

    const res = await request(app).get(`/api/restaurants/${restaurant._id}/food-items`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Visible');
  });

  it('should include unavailable items when includeUnavailable is set', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    await seedFoodItem(app, owner.token, restaurant._id);
    const soft = await seedFoodItem(app, owner.token, restaurant._id, { name: 'Soft deleted' });

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${soft._id}`)
      .set('Authorization', `Bearer ${owner.token}`);

    const res = await request(app).get(`/api/restaurants/${restaurant._id}/food-items?includeUnavailable=true`);

    expect(res.body.data).toHaveLength(2);
  });

  it('should respect pagination params', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    await seedFoodItem(app, owner.token, restaurant._id, { name: 'Amala' });
    await seedFoodItem(app, owner.token, restaurant._id, { name: 'Beans' });
    await seedFoodItem(app, owner.token, restaurant._id, { name: 'Chin chin' });

    const res = await request(app).get(`/api/restaurants/${restaurant._id}/food-items?page=1&limit=2`);

    expect(res.body.data).toHaveLength(2);
  });
});

describe('GET /api/restaurants/:restaurantId/food-items/:id', () => {
  it('should return a single food item', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    const item = await seedFoodItem(app, owner.token, restaurant._id);

    const res = await request(app).get(`/api/restaurants/${restaurant._id}/food-items/${item._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Jollof Rice');
  });

  it('should return 404 for a nonexistent item', async () => {
    const { restaurant } = await buildOwnerAndRestaurant();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app).get(`/api/restaurants/${restaurant._id}/food-items/${fakeId}`);
    expect(res.status).toBe(404);
  });

  it('should return 404 for a soft-deleted item', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    const item = await seedFoodItem(app, owner.token, restaurant._id);

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${owner.token}`);

    const res = await request(app).get(`/api/restaurants/${restaurant._id}/food-items/${item._id}`);
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/restaurants/:restaurantId/food-items/:id', () => {
  it('should allow the owner to update fields', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    const item = await seedFoodItem(app, owner.token, restaurant._id);

    const res = await request(app)
      .patch(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Fried Rice', price: 2800 });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Fried Rice');
    expect(res.body.data.price).toBe(2800);
  });

  it('should return 403 for a non-owner', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    const item = await seedFoodItem(app, owner.token, restaurant._id);
    const stranger = await seedUser(app);

    const res = await request(app)
      .patch(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${stranger.token}`)
      .send({ name: 'Nope' });

    expect(res.status).toBe(403);
  });

  it('should return 400 for invalid updates', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    const item = await seedFoodItem(app, owner.token, restaurant._id);

    const res = await request(app)
      .patch(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ price: -200 });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/restaurants/:restaurantId/food-items/:id', () => {
  it('should soft-delete the item', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    const item = await seedFoodItem(app, owner.token, restaurant._id);

    const res = await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${owner.token}`);

    expect(res.status).toBe(204);
  });

  it('should remove the item from the public listing', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    const item = await seedFoodItem(app, owner.token, restaurant._id);

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${owner.token}`);

    const listing = await request(app).get(`/api/restaurants/${restaurant._id}/food-items`);
    expect(listing.body.data).toHaveLength(0);
  });

  it('should return 403 for a non-owner', async () => {
    const { owner, restaurant } = await buildOwnerAndRestaurant();
    const item = await seedFoodItem(app, owner.token, restaurant._id);
    const stranger = await seedUser(app);

    const res = await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${stranger.token}`);

    expect(res.status).toBe(403);
  });
});
