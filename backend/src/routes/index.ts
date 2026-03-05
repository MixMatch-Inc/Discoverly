import { Router } from "express"
import { healthRouter } from "./health.routes.js"
import { swipeRouter } from "./swipe.routes.js"

export const apiRouter = Router()

apiRouter.use("/health", healthRouter)
apiRouter.use("/swipe", swipeRouter)
