import assert from "node:assert/strict"
import test from "node:test"
import request from "supertest"
import { CartItemModel, FoodItemModel, UserSwipeModel } from "../src/models/index.js"
import { createApp } from "../src/app.js"

test("POST /api/swipe with action=pass stores swipe and does not create cart item", async () => {
  const app = createApp()

  const originalFindById = FoodItemModel.findById
  const originalSwipeUpsert = UserSwipeModel.findOneAndUpdate
  const originalCartUpsert = CartItemModel.findOneAndUpdate

  let cartUpsertCalls = 0

  ;(FoodItemModel.findById as unknown as (...args: unknown[]) => Promise<unknown>) = async () => ({
    _id: "660000000000000000000100",
  })
  ;(UserSwipeModel.findOneAndUpdate as unknown as (...args: unknown[]) => Promise<unknown>) =
    async () => ({
      _id: "770000000000000000000001",
    })
  ;(CartItemModel.findOneAndUpdate as unknown as (...args: unknown[]) => Promise<unknown>) =
    async () => {
      cartUpsertCalls += 1
      return {}
    }

  const response = await request(app)
    .post("/api/swipe")
    .set("x-user-id", "660000000000000000000001")
    .send({ foodId: "660000000000000000000100", action: "pass" })

  assert.equal(response.status, 201)
  assert.equal(response.body.swipe.action, "pass")
  assert.equal(cartUpsertCalls, 0)

  FoodItemModel.findById = originalFindById
  UserSwipeModel.findOneAndUpdate = originalSwipeUpsert
  CartItemModel.findOneAndUpdate = originalCartUpsert
})

test("POST /api/swipe with action=like stores swipe and creates cart item", async () => {
  const app = createApp()

  const originalFindById = FoodItemModel.findById
  const originalSwipeUpsert = UserSwipeModel.findOneAndUpdate
  const originalCartUpsert = CartItemModel.findOneAndUpdate

  let cartUpsertCalls = 0

  ;(FoodItemModel.findById as unknown as (...args: unknown[]) => Promise<unknown>) = async () => ({
    _id: "660000000000000000000100",
  })
  ;(UserSwipeModel.findOneAndUpdate as unknown as (...args: unknown[]) => Promise<unknown>) =
    async () => ({
      _id: "770000000000000000000001",
    })
  ;(CartItemModel.findOneAndUpdate as unknown as (...args: unknown[]) => Promise<unknown>) =
    async () => {
      cartUpsertCalls += 1
      return {}
    }

  const response = await request(app)
    .post("/api/swipe")
    .set("x-user-id", "660000000000000000000001")
    .send({ foodId: "660000000000000000000100", action: "like" })

  assert.equal(response.status, 201)
  assert.equal(response.body.swipe.action, "like")
  assert.equal(cartUpsertCalls, 1)

  FoodItemModel.findById = originalFindById
  UserSwipeModel.findOneAndUpdate = originalSwipeUpsert
  CartItemModel.findOneAndUpdate = originalCartUpsert
})

test("POST /api/swipe returns 404 when foodId does not exist", async () => {
  const app = createApp()
  const originalFindById = FoodItemModel.findById

  ;(FoodItemModel.findById as unknown as (...args: unknown[]) => Promise<unknown>) = async () =>
    null

  const response = await request(app)
    .post("/api/swipe")
    .set("x-user-id", "660000000000000000000001")
    .send({ foodId: "660000000000000000000100", action: "like" })

  assert.equal(response.status, 404)
  assert.equal(response.body.error, "Not Found")

  FoodItemModel.findById = originalFindById
})
