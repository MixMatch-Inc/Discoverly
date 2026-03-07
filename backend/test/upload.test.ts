import assert from "node:assert/strict"
import test from "node:test"
import request from "supertest"
import { createApp } from "../src/app.js"

test("POST /api/upload returns 400 when file is missing", async () => {
  const app = createApp()

  const response = await request(app).post("/api/upload")

  assert.equal(response.status, 400)
  assert.equal(response.body.error, "Bad Request")
  assert.equal(response.body.message, "Missing image file in form-data field 'file'")
})

test("POST /api/upload returns 400 for unsupported file type", async () => {
  const app = createApp()

  const response = await request(app).post("/api/upload").attach("file", Buffer.from("hello"), {
    filename: "note.txt",
    contentType: "text/plain",
  })

  assert.equal(response.status, 400)
  assert.equal(response.body.error, "Bad Request")
  assert.equal(response.body.message, "Unsupported file type. Allowed types: jpeg, png, webp.")
})

test("POST /api/upload returns 400 when file exceeds 5MB", async () => {
  const app = createApp()
  const bigBuffer = Buffer.alloc(5 * 1024 * 1024 + 1, 1)

  const response = await request(app).post("/api/upload").attach("file", bigBuffer, {
    filename: "too-large.png",
    contentType: "image/png",
  })

  assert.equal(response.status, 400)
  assert.equal(response.body.error, "Bad Request")
  assert.equal(response.body.message, "File exceeds maximum size of 5MB")
})
