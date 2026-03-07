import { Router } from "express"
import { authRouter } from "./auth.routes.js"
import { healthRouter } from "./health.routes.js"
import { swipeRouter } from "./swipe.routes.js"
import { restaurantFoodsRouter } from "./restaurant-foods.routes.js"
import { pingRouter } from "./ping.routes.js"

export const apiRouter = Router()

apiRouter.use("/health", healthRouter)
apiRouter.use("/swipe", swipeRouter)
apiRouter.use("/restaurant/foods", restaurantFoodsRouter)
apiRouter.use("/auth", authRouter)
apiRouter.use("/ping", pingRouter)
