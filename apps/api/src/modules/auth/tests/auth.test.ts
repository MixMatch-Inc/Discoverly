import { afterAll, beforeAll, afterEach, describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import { createApp } from '../../../app';
import { UserModel } from '../../users/repositories/user.model';

const app = createApp();

let mongo: MongoMemoryServer;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
});

afterEach(async () => {
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

describe('POST /api/auth/register', () => {
  it('registers a new user and returns a token', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'new.user@example.com',
      password: 'password123',
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('new.user@example.com');
    expect(response.body.token).toBeTypeOf('string');
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({
      email: 'duplicate@example.com',
      password: 'password123',
    });

    const response = await request(app).post('/api/auth/register').send({
      email: 'duplicate@example.com',
      password: 'anotherPassword123',
    });

    expect(response.status).toBe(409);
    expect(response.body.message).toMatch(/already exists/i);
  });

  it('rejects invalid input', async () => {
    const response = await request(app).post('/api/auth/register').send({
      email: 'not-an-email',
      password: 'short',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toBeInstanceOf(Array);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });
});

describe('POST /api/auth/login', () => {
  const credentials = { email: 'login.user@example.com', password: 'password123' };

  beforeAll(async () => {
    await request(app).post('/api/auth/register').send(credentials);
  });

  it('logs in with valid credentials', async () => {
    const response = await request(app).post('/api/auth/login').send(credentials);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(credentials.email);
    expect(response.body.token).toBeTypeOf('string');
  });

  it('rejects an invalid password', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrongPassword' });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid email or password/i);
  });

  it('rejects a non-existent account', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'missing@example.com', password: 'password123' });

    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/invalid email or password/i);
  });
});
