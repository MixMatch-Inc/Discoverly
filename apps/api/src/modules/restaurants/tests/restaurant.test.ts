import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { createApp } from '../../../app.js';
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

describe('POST /api/restaurants', () => {
  it('should create a restaurant and return 201', async () => {
    const { token } = await seedUser(app);

    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Suya Spot', address: { city: 'Kano', country: 'Nigeria' } });

    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ name: 'Suya Spot', isActive: true });
  });

  it('should derive ownerId from JWT and ignore body value', async () => {
    const { token, userId } = await seedUser(app);

    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Iya Basira', address: { city: 'Ibadan', country: 'Nigeria' }, ownerId: '000000000000000000000000' });

    expect(res.body.data.ownerId).toBe(userId);
  });

  it('should reject unauthenticated requests with 401', async () => {
    const res = await request(app)
      .post('/api/restaurants')
      .send({ name: 'Ghost Kitchen', address: { city: 'Lagos', country: 'Nigeria' } });

    expect(res.status).toBe(401);
  });

  it('should return 400 when required fields are missing', async () => {
    const { token } = await seedUser(app);

    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ address: { city: 'Lagos', country: 'Nigeria' } });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should reject unknown cuisine tags with 400', async () => {
    const { token } = await seedUser(app);

    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Tag Test', address: { city: 'Lagos', country: 'Nigeria' }, cuisineTags: ['alien-food'] });

    expect(res.status).toBe(400);
  });

  it('should block duplicate restaurant ownership with 409', async () => {
    const { token } = await seedUser(app);
    await seedRestaurant(app, token);

    const res = await request(app)
      .post('/api/restaurants')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Duplicate', address: { city: 'PH', country: 'Nigeria' } });

    expect(res.status).toBe(409);
  });
});

describe('GET /api/restaurants', () => {
  it('should return a paginated list of active restaurants', async () => {
    const { token } = await seedUser(app);
    await seedRestaurant(app, token);

    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].isActive).toBe(true);
  });

  it('should hide soft-deleted restaurants from the list', async () => {
    const { token } = await seedUser(app);
    const r = await seedRestaurant(app, token);

    await request(app).delete(`/api/restaurants/${r._id}`).set('Authorization', `Bearer ${token}`);

    const res = await request(app).get('/api/restaurants');
    expect(res.body.data).toHaveLength(0);
  });

  it('should paginate correctly with page and limit', async () => {
    const u1 = await seedUser(app);
    await seedRestaurant(app, u1.token, { name: 'First' });
    const u2 = await seedUser(app);
    await seedRestaurant(app, u2.token, { name: 'Second' });

    const res = await request(app).get('/api/restaurants?page=2&limit=1');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should return an empty array when no restaurants exist', async () => {
    const res = await request(app).get('/api/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});

describe('GET /api/restaurants/:id', () => {
  it('should return the restaurant by ID', async () => {
    const { token } = await seedUser(app);
    const r = await seedRestaurant(app, token);

    const res = await request(app).get(`/api/restaurants/${r._id}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Mama Nkechi Kitchen');
  });

  it('should return 404 for a nonexistent ID', async () => {
    const id = new mongoose.Types.ObjectId().toString();
    const res = await request(app).get(`/api/restaurants/${id}`);

    expect(res.status).toBe(404);
  });

  it('should return 404 for a soft-deleted restaurant', async () => {
    const { token } = await seedUser(app);
    const r = await seedRestaurant(app, token);

    await request(app).delete(`/api/restaurants/${r._id}`).set('Authorization', `Bearer ${token}`);

    const res = await request(app).get(`/api/restaurants/${r._id}`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/restaurants/me', () => {
  it('should return the caller\'s own restaurant', async () => {
    const { token } = await seedUser(app);
    await seedRestaurant(app, token);

    const res = await request(app).get('/api/restaurants/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Mama Nkechi Kitchen');
  });

  it('should return 404 when the caller has no restaurant', async () => {
    const { token } = await seedUser(app);

    const res = await request(app).get('/api/restaurants/me').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
  });

  it('should return 401 without auth', async () => {
    const res = await request(app).get('/api/restaurants/me');
    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/restaurants/:id', () => {
  it('should allow the owner to update fields', async () => {
    const { token } = await seedUser(app);
    const r = await seedRestaurant(app, token);

    const res = await request(app)
      .patch(`/api/restaurants/${r._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Renamed Kitchen', description: 'Now with extra spice' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Renamed Kitchen');
    expect(res.body.data.description).toBe('Now with extra spice');
  });

  it('should return 403 when a non-owner tries to update', async () => {
    const owner = await seedUser(app);
    const r = await seedRestaurant(app, owner.token);
    const stranger = await seedUser(app);

    const res = await request(app)
      .patch(`/api/restaurants/${r._id}`)
      .set('Authorization', `Bearer ${stranger.token}`)
      .send({ name: 'Stolen' });

    expect(res.status).toBe(403);
  });

  it('should return 400 for invalid data', async () => {
    const { token } = await seedUser(app);
    const r = await seedRestaurant(app, token);

    const res = await request(app)
      .patch(`/api/restaurants/${r._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'x' });

    expect(res.status).toBe(400);
  });
});

describe('DELETE /api/restaurants/:id', () => {
  it('should soft-delete the restaurant', async () => {
    const { token } = await seedUser(app);
    const r = await seedRestaurant(app, token);

    const res = await request(app)
      .delete(`/api/restaurants/${r._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it('should remove the restaurant from the public listing', async () => {
    const { token } = await seedUser(app);
    const r = await seedRestaurant(app, token);

    await request(app).delete(`/api/restaurants/${r._id}`).set('Authorization', `Bearer ${token}`);

    const listing = await request(app).get('/api/restaurants');
    expect(listing.body.data).toHaveLength(0);
  });

  it('should return 403 when a non-owner tries to delete', async () => {
    const owner = await seedUser(app);
    const r = await seedRestaurant(app, owner.token);
    const stranger = await seedUser(app);

    const res = await request(app)
      .delete(`/api/restaurants/${r._id}`)
      .set('Authorization', `Bearer ${stranger.token}`);

    expect(res.status).toBe(403);
  });
});
