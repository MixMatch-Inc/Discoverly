import assert from "node:assert/strict"
import test from "node:test"
import jwt from "jsonwebtoken"
import request from "supertest"
import { createApp } from "../src/app.js"
import { env } from "../src/config/env.js"

test("GET /api/auth/me returns 401 without bearer token", async () => {
  const app = createApp()
  const response = await request(app).get("/api/auth/me")

  assert.equal(response.status, 401)
  assert.equal(response.body.error, "Unauthorized")
})

test("GET /api/auth/restaurant-zone returns 403 for user role", async () => {
  const app = createApp()
  const token = jwt.sign({ sub: "u1", role: "user" }, env.JWT_SECRET)
  const response = await request(app)
    .get("/api/auth/restaurant-zone")
    .set("Authorization", `Bearer ${token}`)

  assert.equal(response.status, 403)
  assert.equal(response.body.error, "Forbidden")
})

test("GET /api/auth/restaurant-zone returns 200 for restaurant role", async () => {
  const app = createApp()
  const token = jwt.sign({ sub: "r1", role: "restaurant" }, env.JWT_SECRET)
  const response = await request(app)
    .get("/api/auth/restaurant-zone")
    .set("Authorization", `Bearer ${token}`)

  assert.equal(response.status, 200)
  assert.equal(response.body.ok, true)
})
