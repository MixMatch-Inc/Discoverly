import { Router } from "express"
import { Types } from "mongoose"
import { z } from "zod"
import { validateRequest } from "../middleware/validate-request.middleware.js"
import { CartItemModel, FoodItemModel, UserSwipeModel } from "../models/index.js"

const swipeSchema = z.object({
  foodId: z.string().min(1),
  action: z.enum(["like", "pass"]),
})

export const swipeRouter = Router()

swipeRouter.post("/", validateRequest({ body: swipeSchema }), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof swipeSchema>
    const userIdRaw = req.user?.id ?? req.header("x-user-id")
    if (!userIdRaw) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Missing authenticated user id",
      })
      return
    }

    if (!Types.ObjectId.isValid(body.foodId)) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid foodId",
      })
      return
    }

    if (!Types.ObjectId.isValid(userIdRaw)) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid user id",
      })
      return
    }

    const food = await FoodItemModel.findById(body.foodId)
    if (!food) {
      res.status(404).json({
        error: "Not Found",
        message: "Food item not found",
      })
      return
    }

    const userId = new Types.ObjectId(userIdRaw)
    const foodId = new Types.ObjectId(body.foodId)

    const swipe = await UserSwipeModel.create({
      user_id: userId,
      food_id: foodId,
      action: body.action,
      timestamp: new Date(),
    })

    if (body.action === "like") {
      await CartItemModel.create({
        user_id: userId,
        food_id: foodId,
        quantity: 1,
        status: "active",
      })
    }

    res.status(201).json({
      ok: true,
      swipe: {
        id: String(swipe._id),
        foodId: body.foodId,
        action: body.action,
      },
    })
  } catch (error) {
    next(error)
  }
})
