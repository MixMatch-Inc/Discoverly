import { Router } from "express"
import { healthRouter } from "./health.routes.js"
import { restaurantFoodsRouter } from "./restaurant-foods.routes.js"

export const apiRouter = Router()

apiRouter.use("/health", healthRouter)
apiRouter.use("/restaurant/foods", restaurantFoodsRouter)
