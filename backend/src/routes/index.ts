import { Router } from "express"
import { foodsRouter } from "./foods.routes.js"
import { healthRouter } from "./health.routes.js"

export const apiRouter = Router()

apiRouter.use("/health", healthRouter)
apiRouter.use("/foods", foodsRouter)
