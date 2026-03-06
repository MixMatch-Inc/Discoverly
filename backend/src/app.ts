import cors from "cors"
import express from "express"
import rateLimit from "express-rate-limit"
import helmet from "helmet"
import morgan from "morgan"
import { apiRouter } from "./routes/index.js"
import { errorHandler } from "./middleware/error.middleware.js"
import { notFoundHandler } from "./middleware/not-found.middleware.js"

export function createApp() {
  const app = express()

  app.use(helmet())
  app.use(cors())
  app.use(morgan("dev"))
  app.use(express.json())

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  )

  app.use("/api", apiRouter)
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
