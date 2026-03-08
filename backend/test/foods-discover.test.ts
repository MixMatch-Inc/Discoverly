import assert from "node:assert/strict"
import test from "node:test"
import request from "supertest"
import { RestaurantModel } from "../src/models/index.js"
import { createApp } from "../src/app.js"

test("GET /api/foods/discover returns 400 when coordinates are missing", async () => {
  const app = createApp()

  const response = await request(app).get("/api/foods/discover")

  assert.equal(response.status, 400)
  assert.equal(response.body.error, "Bad Request")
})

test("GET /api/foods/discover returns paginated data with distance", async () => {
  const app = createApp()
  const originalAggregate = RestaurantModel.aggregate
  let capturedPipeline: Record<string, unknown>[] = []

  ;(RestaurantModel.aggregate as unknown as (...args: unknown[]) => Promise<unknown>) = async (
    pipeline: Record<string, unknown>[],
  ) => {
    capturedPipeline = pipeline
    return [
      {
        food_id: "660000000000000000000101",
        restaurant_id: "660000000000000000000201",
        food_name: "Spicy Bowl",
        description: "House special",
        price: 12.5,
        image_url: "https://example.com/a.png",
        restaurant_name: "Demo Restaurant",
        distance_meters: 128.4,
      },
    ]
  }

  const response = await request(app).get("/api/foods/discover?longitude=-73.99&latitude=40.73")

  assert.equal(response.status, 200)
  assert.equal(response.body.items.length, 1)
  assert.equal(response.body.items[0].name, "Spicy Bowl")
  assert.equal(response.body.items[0].distanceMeters, 128.4)
  assert.equal(response.body.cursor, null)
  assert.ok(
    capturedPipeline.some((stage) => {
      const sort = stage.$sort as Record<string, unknown> | undefined
      return sort?.distance_meters === 1
    }),
  )

  RestaurantModel.aggregate = originalAggregate
})

test("GET /api/foods/discover returns next cursor when more than one page", async () => {
  const app = createApp()
  const originalAggregate = RestaurantModel.aggregate

  ;(RestaurantModel.aggregate as unknown as (...args: unknown[]) => Promise<unknown>) = async () =>
    Array.from({ length: 11 }, (_, index) => ({
      food_id: `660000000000000000000${index + 100}`,
      restaurant_id: "660000000000000000000200",
      food_name: `Dish ${index + 1}`,
      description: "desc",
      price: 10 + index,
      image_url: "https://example.com/x.png",
      restaurant_name: "Demo Restaurant",
      distance_meters: 25 + index,
    }))

  const response = await request(app).get("/api/foods/discover?longitude=-73.99&latitude=40.73")

  assert.equal(response.status, 200)
  assert.equal(response.body.items.length, 10)
  assert.ok(typeof response.body.cursor === "string")

  RestaurantModel.aggregate = originalAggregate
})

test("GET /api/foods/discover returns 400 for invalid cursor", async () => {
  const app = createApp()

  const response = await request(app).get(
    "/api/foods/discover?longitude=-73.99&latitude=40.73&cursor=not-base64",
  )

  assert.equal(response.status, 400)
  assert.equal(response.body.error, "Bad Request")
  assert.equal(response.body.message, "Invalid cursor")
})
