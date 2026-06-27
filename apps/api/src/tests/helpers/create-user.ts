import type { Express } from 'express';
import request from 'supertest';

let seq = 0;

export async function seedUser(app: Express, overrideEmail?: string) {
  seq++;
  const email = overrideEmail ?? `dev${seq}-${Date.now()}@test.io`;
  const res = await request(app).post('/api/auth/register').send({
    email,
    password: 'Test1234!',
  });
  return {
    token: res.body.token as string,
    userId: res.body.user.id as string,
    email,
  };
}
