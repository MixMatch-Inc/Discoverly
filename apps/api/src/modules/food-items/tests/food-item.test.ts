import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../../app.js';
import { createFoodItem } from '../../../tests/helpers/create-food-item.js';
import { createRestaurant } from '../../../tests/helpers/create-restaurant.js';
import { createUser } from '../../../tests/helpers/create-user.js';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterEach(async () => {
  await mongoose.connection.dropDatabase();
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

const app = createApp();

async function setupOwnerWithRestaurant() {
  const owner = await createUser(app);
  const restaurant = await createRestaurant(app, owner.token);
  return { owner, restaurant };
}

describe('POST /api/restaurants/:restaurantId/food-items', () => {
  it('creates a food item for the restaurant owner', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();

    const res = await request(app)
      .post(`/api/restaurants/${restaurant._id}/food-items`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Burger', price: 1500, category: 'main' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Burger');
    expect(res.body.data.price).toBe(1500);
    expect(res.body.data.restaurantId).toBe(restaurant._id);
  });

  it('returns 403 when a different user attempts creation', async () => {
    const { restaurant } = await setupOwnerWithRestaurant();
    const other = await createUser(app);

    const res = await request(app)
      .post(`/api/restaurants/${restaurant._id}/food-items`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ name: 'Burger', price: 1500, category: 'main' });

    expect(res.status).toBe(403);
  });

  it('returns 401 for unauthenticated requests', async () => {
    const { restaurant } = await setupOwnerWithRestaurant();

    const res = await request(app)
      .post(`/api/restaurants/${restaurant._id}/food-items`)
      .send({ name: 'Burger', price: 1500, category: 'main' });

    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid input', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();

    const res = await request(app)
      .post(`/api/restaurants/${restaurant._id}/food-items`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ price: -100, category: 'main' });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 for unknown dietaryTag', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();

    const res = await request(app)
      .post(`/api/restaurants/${restaurant._id}/food-items`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Salad', price: 800, category: 'starter', dietaryTags: ['not-real'] });

    expect(res.status).toBe(400);
  });

  it('returns 404 when restaurantId does not exist', async () => {
    const { owner } = await setupOwnerWithRestaurant();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/api/restaurants/${fakeId}/food-items`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Burger', price: 1500, category: 'main' });

    expect(res.status).toBe(404);
  });
});

describe('GET /api/restaurants/:restaurantId/food-items', () => {
  it('returns only available items for public requests', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    await createFoodItem(app, owner.token, restaurant._id);
    const item2 = await createFoodItem(app, owner.token, restaurant._id, { name: 'Hidden Item' });

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${item2._id}`)
      .set('Authorization', `Bearer ${owner.token}`);

    const res = await request(app).get(`/api/restaurants/${restaurant._id}/food-items`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns all items when owner requests with includeUnavailable', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    await createFoodItem(app, owner.token, restaurant._id);
    const item2 = await createFoodItem(app, owner.token, restaurant._id, { name: 'Hidden Item' });

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${item2._id}`)
      .set('Authorization', `Bearer ${owner.token}`);

    const res = await request(app)
      .get(`/api/restaurants/${restaurant._id}/food-items?includeUnavailable=true`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
  });

  it('returns correct pagination metadata', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    await createFoodItem(app, owner.token, restaurant._id, { name: 'Item 1' });
    await createFoodItem(app, owner.token, restaurant._id, { name: 'Item 2' });

    const res = await request(app)
      .get(`/api/restaurants/${restaurant._id}/food-items?page=1&limit=1`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(2);
  });
});

describe('GET /api/restaurants/:restaurantId/food-items/:id', () => {
  it('returns the food item when it exists', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    const item = await createFoodItem(app, owner.token, restaurant._id);

    const res = await request(app)
      .get(`/api/restaurants/${restaurant._id}/food-items/${item._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Margherita Pizza');
  });

  it('returns 404 for a non-existent item ID', async () => {
    const { restaurant } = await setupOwnerWithRestaurant();
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .get(`/api/restaurants/${restaurant._id}/food-items/${fakeId}`);

    expect(res.status).toBe(404);
  });

  it('returns 404 for a soft-deleted item', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    const item = await createFoodItem(app, owner.token, restaurant._id);

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${owner.token}`);

    const res = await request(app)
      .get(`/api/restaurants/${restaurant._id}/food-items/${item._id}`);

    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/restaurants/:restaurantId/food-items/:id', () => {
  it('owner can update name and price', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    const item = await createFoodItem(app, owner.token, restaurant._id);

    const res = await request(app)
      .patch(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ name: 'Updated Pizza', price: 1400 });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Pizza');
    expect(res.body.data.price).toBe(1400);
  });

  it('returns 403 for non-owner', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    const item = await createFoodItem(app, owner.token, restaurant._id);
    const other = await createUser(app);

    const res = await request(app)
      .patch(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ name: 'Hijacked' });

    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid updates', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    const item = await createFoodItem(app, owner.token, restaurant._id);

    const res = await request(app)
      .patch(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${owner.token}`)
      .send({ price: -50 });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/restaurants/:restaurantId/food-items/:id', () => {
  it('sets isAvailable to false', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    const item = await createFoodItem(app, owner.token, restaurant._id);

    const res = await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${owner.token}`);

    expect(res.status).toBe(204);
  });

  it('item no longer appears in public list after deletion', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    const item = await createFoodItem(app, owner.token, restaurant._id);

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${owner.token}`);

    const list = await request(app).get(`/api/restaurants/${restaurant._id}/food-items`);
    expect(list.body.data).toHaveLength(0);
  });

  it('returns 403 for non-owner', async () => {
    const { owner, restaurant } = await setupOwnerWithRestaurant();
    const item = await createFoodItem(app, owner.token, restaurant._id);
    const other = await createUser(app);

    const res = await request(app)
      .delete(`/api/restaurants/${restaurant._id}/food-items/${item._id}`)
      .set('Authorization', `Bearer ${other.token}`);

    expect(res.status).toBe(403);
  });
});
