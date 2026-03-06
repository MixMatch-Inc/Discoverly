import { Router } from "express"
import { healthRouter } from "./health.routes.js"
import { uploadRouter } from "./upload.routes.js"

export const apiRouter = Router()

apiRouter.use("/health", healthRouter)
apiRouter.use("/upload", uploadRouter)
