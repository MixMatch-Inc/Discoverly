import { Router } from "express"
import { foodsRouter } from "./foods.routes.js"
import { authRouter } from "./auth.routes.js"
import { healthRouter } from "./health.routes.js"
import { uploadRouter } from "./upload.routes.js"
import { swipeRouter } from "./swipe.routes.js"
import { restaurantFoodsRouter } from "./restaurant-foods.routes.js"
import { restaurantAnalyticsRouter } from "./restaurant-analytics.routes.js"
import { pingRouter } from "./ping.routes.js"

export const apiRouter = Router()

apiRouter.use("/health", healthRouter)
apiRouter.use("/foods", foodsRouter)
apiRouter.use("/upload", uploadRouter)
apiRouter.use("/swipe", swipeRouter)
apiRouter.use("/restaurant/foods", restaurantFoodsRouter)
apiRouter.use("/restaurant/analytics", restaurantAnalyticsRouter)
apiRouter.use("/auth", authRouter)
apiRouter.use("/ping", pingRouter)
