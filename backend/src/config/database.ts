import mongoose from "mongoose"
import { env } from "./env.js"

export async function connectDatabase(): Promise<void> {
  const maxAttempts = 10
  const retryDelayMs = 2000

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(env.MONGODB_URI)
      return
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs))
    }
  }
}
