import test from "node:test"
import assert from "node:assert/strict"
import request from "supertest"
import { createApp } from "../src/app.js"

test("POST /api/ping accepts valid payload", async () => {
  const app = createApp()
  const response = await request(app).post("/api/ping").send({ message: "hello" })

  assert.equal(response.status, 200)
  assert.deepEqual(response.body, { ok: true, echo: "hello" })
})

test("POST /api/ping rejects invalid payload with structured 400", async () => {
  const app = createApp()
  const response = await request(app).post("/api/ping").send({})

  assert.equal(response.status, 400)
  assert.equal(response.body.error, "Bad Request")
  assert.equal(response.body.message, "Validation failed")
  assert.ok(Array.isArray(response.body.details))
  assert.equal(response.body.details[0].path, "message")
})
