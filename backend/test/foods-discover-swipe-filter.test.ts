import assert from "node:assert/strict"
import test from "node:test"
import request from "supertest"
import { RestaurantModel, UserSwipeModel } from "../src/models/index.js"
import { createApp } from "../src/app.js"

test("GET /api/foods/discover excludes swiped food ids when user_id is provided", async () => {
  const app = createApp()

  const originalDistinct = UserSwipeModel.distinct
  const originalAggregate = RestaurantModel.aggregate

  let capturedPipeline: Record<string, unknown>[] = []

  ;(UserSwipeModel.distinct as unknown as (...args: unknown[]) => Promise<unknown>) = async () => [
    "660000000000000000000500",
  ]
  ;(RestaurantModel.aggregate as unknown as (...args: unknown[]) => Promise<unknown>) = async (
    pipeline: Record<string, unknown>[],
  ) => {
    capturedPipeline = pipeline
    return []
  }

  const response = await request(app).get(
    "/api/foods/discover?longitude=-73.99&latitude=40.73&user_id=660000000000000000000001",
  )

  assert.equal(response.status, 200)
  assert.ok(
    capturedPipeline.some((stage) => {
      const match = stage.$match as Record<string, unknown> | undefined
      const foods = match?.["foods._id"] as { $nin?: unknown[] } | undefined
      return Array.isArray(foods?.$nin)
    }),
  )

  UserSwipeModel.distinct = originalDistinct
  RestaurantModel.aggregate = originalAggregate
})

test("GET /api/foods/discover does not apply swipe exclusion without user_id", async () => {
  const app = createApp()

  const originalDistinct = UserSwipeModel.distinct
  const originalAggregate = RestaurantModel.aggregate

  let distinctCalls = 0
  let capturedPipeline: Record<string, unknown>[] = []

  ;(UserSwipeModel.distinct as unknown as (...args: unknown[]) => Promise<unknown>) = async () => {
    distinctCalls += 1
    return []
  }
  ;(RestaurantModel.aggregate as unknown as (...args: unknown[]) => Promise<unknown>) = async (
    pipeline: Record<string, unknown>[],
  ) => {
    capturedPipeline = pipeline
    return []
  }

  const response = await request(app).get("/api/foods/discover?longitude=-73.99&latitude=40.73")

  assert.equal(response.status, 200)
  assert.equal(distinctCalls, 0)
  assert.equal(
    capturedPipeline.some((stage) => {
      const match = stage.$match as Record<string, unknown> | undefined
      return Boolean(match?.["foods._id"])
    }),
    false,
  )

  UserSwipeModel.distinct = originalDistinct
  RestaurantModel.aggregate = originalAggregate
})
