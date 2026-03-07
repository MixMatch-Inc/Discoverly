import assert from "node:assert/strict"
import test from "node:test"
import jwt from "jsonwebtoken"
import request from "supertest"
import { createApp } from "../src/app.js"
import { env } from "../src/config/env.js"
import { FoodItemModel, RestaurantModel } from "../src/models/index.js"

test("PUT /api/restaurant/foods/:id returns 403 when non-owner restaurant tries update", async () => {
  const app = createApp()
  const token = jwt.sign({ sub: "660000000000000000000001", role: "restaurant" }, env.JWT_SECRET)

  const originalFindById = FoodItemModel.findById
  const originalFindByIdAndUpdate = FoodItemModel.findByIdAndUpdate

  ;(FoodItemModel.findById as unknown as (...args: unknown[]) => Promise<unknown>) = async () => ({
    _id: "660000000000000000000099",
    owner_user_id: "660000000000000000000777",
    is_active: true,
  })
  ;(FoodItemModel.findByIdAndUpdate as unknown as (...args: unknown[]) => Promise<unknown>) = async () => null

  const response = await request(app)
    .put("/api/restaurant/foods/660000000000000000000099")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Updated Name" })

  assert.equal(response.status, 403)
  assert.equal(response.body.error, "Forbidden")

  FoodItemModel.findById = originalFindById
  FoodItemModel.findByIdAndUpdate = originalFindByIdAndUpdate
})

test("DELETE /api/restaurant/foods/:id returns 404 when food does not exist", async () => {
  const app = createApp()
  const token = jwt.sign({ sub: "660000000000000000000001", role: "restaurant" }, env.JWT_SECRET)
  const originalFindById = FoodItemModel.findById

  ;(FoodItemModel.findById as unknown as (...args: unknown[]) => Promise<unknown>) = async () => null

  const response = await request(app)
    .delete("/api/restaurant/foods/660000000000000000000099")
    .set("Authorization", `Bearer ${token}`)

  assert.equal(response.status, 404)
  assert.equal(response.body.error, "Not Found")

  FoodItemModel.findById = originalFindById
})

test("POST /api/restaurant/foods creates item for authenticated restaurant owner", async () => {
  const app = createApp()
  const ownerId = "660000000000000000000001"
  const token = jwt.sign({ sub: ownerId, role: "restaurant" }, env.JWT_SECRET)

  const originalFindOne = RestaurantModel.findOne
  const originalCreate = FoodItemModel.create

  ;(RestaurantModel.findOne as unknown as (...args: unknown[]) => Promise<unknown>) = async () => ({
    _id: "660000000000000000000010",
    owner_user_id: ownerId,
    is_active: true,
  })
  ;(FoodItemModel.create as unknown as (...args: unknown[]) => Promise<unknown>) = async (payload: {
    restaurant_id: string
    owner_user_id: string
    name: string
    price: number
    description: string
    image_url: string
    is_active: boolean
  }) => ({
    _id: "660000000000000000000099",
    ...payload,
  })

  const response = await request(app)
    .post("/api/restaurant/foods")
    .set("Authorization", `Bearer ${token}`)
    .send({
      name: "Spicy Bowl",
      price: 14.5,
      description: "Chili crunch bowl",
      image_url: "https://example.com/food.png",
    })

  assert.equal(response.status, 201)
  assert.equal(response.body.name, "Spicy Bowl")
  assert.equal(response.body.is_active, true)

  RestaurantModel.findOne = originalFindOne
  FoodItemModel.create = originalCreate
})
