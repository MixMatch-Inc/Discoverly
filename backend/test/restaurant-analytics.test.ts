import assert from "node:assert/strict"
import test from "node:test"
import jwt from "jsonwebtoken"
import request from "supertest"
import { createApp } from "../src/app.js"
import { env } from "../src/config/env.js"
import { UserSwipeModel } from "../src/models/index.js"

test("GET /api/restaurant/analytics returns grouped metrics for authenticated restaurant owner", async () => {
  const app = createApp()
  const token = jwt.sign({ sub: "660000000000000000000001", role: "restaurant" }, env.JWT_SECRET)
  const originalAggregate = UserSwipeModel.aggregate

  ;(UserSwipeModel.aggregate as unknown as (...args: unknown[]) => Promise<unknown>) = async () => [
    {
      food_id: "660000000000000000000101",
      food_name: "Spicy Bowl",
      total_views: 25,
      likes: 10,
      passes: 15,
      conversion_rate: 40,
    },
    {
      food_id: "660000000000000000000102",
      food_name: "Cheese Burger",
      total_views: 10,
      likes: 3,
      passes: 7,
      conversion_rate: 30,
    },
  ]

  const response = await request(app)
    .get("/api/restaurant/analytics")
    .set("Authorization", `Bearer ${token}`)

  assert.equal(response.status, 200)
  assert.equal(response.body.items.length, 2)
  assert.equal(response.body.items[0].foodName, "Spicy Bowl")
  assert.equal(response.body.items[0].totalViews, 25)
  assert.equal(response.body.items[0].likes, 10)
  assert.equal(response.body.items[0].passes, 15)
  assert.equal(response.body.items[0].conversionRate, 40)

  UserSwipeModel.aggregate = originalAggregate
})

test("GET /api/restaurant/analytics returns 401 without token", async () => {
  const app = createApp()
  const response = await request(app).get("/api/restaurant/analytics")

  assert.equal(response.status, 401)
  assert.equal(response.body.error, "Unauthorized")
})

test("GET /api/restaurant/analytics returns 403 for non-restaurant role", async () => {
  const app = createApp()
  const token = jwt.sign({ sub: "660000000000000000000001", role: "user" }, env.JWT_SECRET)

  const response = await request(app)
    .get("/api/restaurant/analytics")
    .set("Authorization", `Bearer ${token}`)

  assert.equal(response.status, 403)
  assert.equal(response.body.error, "Forbidden")
})
