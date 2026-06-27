import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../../app.js';
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

describe('POST /api/restaurants', () => {
  it('creates a restaurant for an authenticated user', async () => {
    const { token } = await createUser(app);
    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Place', address: { city: 'Lagos', country: 'Nigeria' } });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('My Place');
    expect(res.body.data.isActive).toBe(true);
  });

  it('sets ownerId from the JWT, ignoring body ownerId', async () => {
    const { token, userId } = await createUser(app);
    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'My Place', address: { city: 'Lagos', country: 'Nigeria' }, ownerId: 'fake-id' });

    expect(res.status).toBe(201);
    expect(res.body.data.ownerId).toBe(userId);
  });

  it('returns 401 for unauthenticated requests', async () => {
    const res = await request(app)
      .post('/api/restaurants')
      .send({ name: 'No Auth', address: { city: 'Lagos', country: 'Nigeria' } });

    expect(res.status).toBe(401);
  });

  it('returns 400 when name is missing', async () => {
    const { token } = await createUser(app);
    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: { city: 'Lagos', country: 'Nigeria' } });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('returns 400 when an invalid cuisineTag is submitted', async () => {
    const { token } = await createUser(app);
    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Bad Tags', address: { city: 'Lagos', country: 'Nigeria' }, cuisineTags: ['not-a-tag'] });

    expect(res.status).toBe(400);
  });

  it('returns 409 when user already owns a restaurant', async () => {
    const { token } = await createUser(app);
    await createRestaurant(app, token);

    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Second Place', address: { city: 'Abuja', country: 'Nigeria' } });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/restaurants', () => {
  it('returns a paginated list of active restaurants', async () => {
    const { token } = await createUser(app);
    await createRestaurant(app, token);

    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('excludes soft-deleted restaurants', async () => {
    const { token } = await createUser(app);
    const restaurant = await createRestaurant(app, token);

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('respects page and limit params', async () => {
    const user1 = await createUser(app);
    await createRestaurant(app, user1.token, { name: 'Place A' });

    const user2 = await createUser(app);
    await createRestaurant(app, user2.token, { name: 'Place B' });

    const res = await request(app).get('/api/restaurants?page=1&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(2);
    expect(res.body.pagination.limit).toBe(1);
  });

  it('returns empty array when no restaurants match', async () => {
    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('GET /api/restaurants/:id', () => {
  it('returns the restaurant when it exists', async () => {
    const { token } = await createUser(app);
    const restaurant = await createRestaurant(app, token);

    const res = await request(app).get(`/api/restaurants/${restaurant._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Restaurant');
  });

  it('returns 404 for a non-existent ID', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/restaurants/${fakeId}`);

    expect(res.status).toBe(404);
  });

  it('returns 404 for a soft-deleted restaurant', async () => {
    const { token } = await createUser(app);
    const restaurant = await createRestaurant(app, token);

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}`)
      .set('Authorization', `Bearer ${token}`);

    const res = await request(app).get(`/api/restaurants/${restaurant._id}`);

    expect(res.status).toBe(404);
  });
});

describe('GET /api/restaurants/me', () => {
  it('returns the authenticated user\'s restaurant', async () => {
    const { token } = await createUser(app);
    await createRestaurant(app, token);

    const res = await request(app)
      .get('/api/restaurants/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Test Restaurant');
  });

  it('returns 404 when user has no restaurant', async () => {
    const { token } = await createUser(app);

    const res = await request(app)
      .get('/api/restaurants/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('returns 401 when unauthenticated', async () => {
    const res = await request(app).get('/api/restaurants/me');

    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/restaurants/:id', () => {
  it('owner can update name and description', async () => {
    const { token } = await createUser(app);
    const restaurant = await createRestaurant(app, token);

    const res = await request(app)
      .patch(`/api/restaurants/${restaurant._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', description: 'New description' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data.description).toBe('New description');
  });

  it('returns 403 when a different user attempts update', async () => {
    const owner = await createUser(app);
    const restaurant = await createRestaurant(app, owner.token);
    const other = await createUser(app);

    const res = await request(app)
      .patch(`/api/restaurants/${restaurant._id}`)
      .set('Authorization', `Bearer ${other.token}`)
      .send({ name: 'Hijacked' });

    expect(res.status).toBe(403);
  });

  it('returns 400 for invalid field values', async () => {
    const { token } = await createUser(app);
    const restaurant = await createRestaurant(app, token);

    const res = await request(app)
      .patch(`/api/restaurants/${restaurant._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'x' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/restaurants/:id', () => {
  it('sets isActive to false', async () => {
    const { token } = await createUser(app);
    const restaurant = await createRestaurant(app, token);

    const res = await request(app)
      .delete(`/api/restaurants/${restaurant._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('restaurant no longer appears in public list after deletion', async () => {
    const { token } = await createUser(app);
    const restaurant = await createRestaurant(app, token);

    await request(app)
      .delete(`/api/restaurants/${restaurant._id}`)
      .set('Authorization', `Bearer ${token}`);

    const list = await request(app).get('/api/restaurants');
    expect(list.body.data).toHaveLength(0);
  });

  it('returns 403 when a non-owner attempts deletion', async () => {
    const owner = await createUser(app);
    const restaurant = await createRestaurant(app, owner.token);
    const other = await createUser(app);

    const res = await request(app)
      .delete(`/api/restaurants/${restaurant._id}`)
      .set('Authorization', `Bearer ${other.token}`);

    expect(res.status).toBe(403);
  });
});
