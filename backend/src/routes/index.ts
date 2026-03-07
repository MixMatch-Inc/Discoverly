import { Router } from "express"
import { healthRouter } from "./health.routes.js"
import { pingRouter } from "./ping.routes.js"

export const apiRouter = Router()

apiRouter.use("/health", healthRouter)
apiRouter.use("/ping", pingRouter)
