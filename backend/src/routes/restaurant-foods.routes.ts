import { Router } from "express"
import { Types } from "mongoose"
import { z } from "zod"
import { authenticate } from "../middleware/authenticate.middleware.js"
import { requireRole } from "../middleware/require-role.middleware.js"
import { validateRequest } from "../middleware/validate-request.middleware.js"
import { FoodItemModel, RestaurantModel } from "../models/index.js"

const createFoodSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  description: z.string().min(1),
  image_url: z.string().url(),
  restaurant_id: z.string().optional(),
})

const updateFoodSchema = z
  .object({
    name: z.string().min(1).optional(),
    price: z.number().positive().optional(),
    description: z.string().min(1).optional(),
    image_url: z.string().url().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  })

const idParamSchema = z.object({
  id: z.string().min(1),
})

export const restaurantFoodsRouter = Router()

restaurantFoodsRouter.use(authenticate)
restaurantFoodsRouter.use(requireRole(["restaurant", "admin"]))

restaurantFoodsRouter.post("/", validateRequest({ body: createFoodSchema }), async (req, res, next) => {
  try {
    const body = req.body as z.infer<typeof createFoodSchema>
    const requesterId = req.user!.id
    const isAdmin = req.user!.role === "admin"

    const restaurantFilter = isAdmin && body.restaurant_id
      ? { _id: body.restaurant_id, is_active: true }
      : { owner_user_id: requesterId, is_active: true }

    const restaurant = await RestaurantModel.findOne(restaurantFilter)
    if (!restaurant) {
      res.status(404).json({
        error: "Not Found",
        message: "Restaurant not found for current user",
      })
      return
    }

    const created = await FoodItemModel.create({
      restaurant_id: restaurant._id,
      owner_user_id: restaurant.owner_user_id,
      name: body.name,
      price: body.price,
      description: body.description,
      image_url: body.image_url,
      is_active: true,
    })

    res.status(201).json({
      id: String(created._id),
      restaurant_id: String(created.restaurant_id),
      name: created.name,
      price: created.price,
      description: created.description,
      image_url: created.image_url,
      is_active: created.is_active,
    })
  } catch (error) {
    next(error)
  }
})

restaurantFoodsRouter.put(
  "/:id",
  validateRequest({ params: idParamSchema, body: updateFoodSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params as z.infer<typeof idParamSchema>
      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({
          error: "Not Found",
          message: "Food item not found",
        })
        return
      }

      const existing = await FoodItemModel.findById(id)
      if (!existing || !existing.is_active) {
        res.status(404).json({
          error: "Not Found",
          message: "Food item not found",
        })
        return
      }

      const isAdmin = req.user!.role === "admin"
      const isOwner = String(existing.owner_user_id) === req.user!.id
      if (!isAdmin && !isOwner) {
        res.status(403).json({
          error: "Forbidden",
          message: "Cannot modify another restaurant's menu item",
        })
        return
      }

      const update = req.body as z.infer<typeof updateFoodSchema>
      const updated = await FoodItemModel.findByIdAndUpdate(id, update, { new: true })
      if (!updated) {
        res.status(404).json({
          error: "Not Found",
          message: "Food item not found",
        })
        return
      }

      res.status(200).json({
        id: String(updated._id),
        name: updated.name,
        price: updated.price,
        description: updated.description,
        image_url: updated.image_url,
        is_active: updated.is_active,
      })
    } catch (error) {
      next(error)
    }
  },
)

restaurantFoodsRouter.delete(
  "/:id",
  validateRequest({ params: idParamSchema }),
  async (req, res, next) => {
    try {
      const { id } = req.params as z.infer<typeof idParamSchema>
      if (!Types.ObjectId.isValid(id)) {
        res.status(404).json({
          error: "Not Found",
          message: "Food item not found",
        })
        return
      }

      const existing = await FoodItemModel.findById(id)
      if (!existing || !existing.is_active) {
        res.status(404).json({
          error: "Not Found",
          message: "Food item not found",
        })
        return
      }

      const isAdmin = req.user!.role === "admin"
      const isOwner = String(existing.owner_user_id) === req.user!.id
      if (!isAdmin && !isOwner) {
        res.status(403).json({
          error: "Forbidden",
          message: "Cannot modify another restaurant's menu item",
        })
        return
      }

      existing.is_active = false
      await existing.save()

      res.status(200).json({
        ok: true,
        id: String(existing._id),
        is_active: existing.is_active,
      })
    } catch (error) {
      next(error)
    }
  },
)
