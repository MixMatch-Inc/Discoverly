import { Router } from "express"
import { Types, type PipelineStage } from "mongoose"
import { authenticate } from "../middleware/authenticate.middleware.js"
import { requireRole } from "../middleware/require-role.middleware.js"
import { UserSwipeModel } from "../models/index.js"

type AnalyticsRow = {
  food_id: Types.ObjectId
  food_name: string
  total_views: number
  likes: number
  passes: number
  conversion_rate: number
}

export const restaurantAnalyticsRouter = Router()

restaurantAnalyticsRouter.use(authenticate)
restaurantAnalyticsRouter.use(requireRole(["restaurant", "admin"]))

restaurantAnalyticsRouter.get("/", async (req, res, next) => {
  try {
    const requesterId = req.user?.id
    if (!requesterId || !Types.ObjectId.isValid(requesterId)) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid authenticated user id",
      })
      return
    }

    const ownerUserId = new Types.ObjectId(requesterId)

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: "fooditems",
          localField: "food_id",
          foreignField: "_id",
          as: "food",
        },
      },
      {
        $unwind: "$food",
      },
      {
        $match: {
          "food.owner_user_id": ownerUserId,
        },
      },
      {
        $group: {
          _id: "$food_id",
          food_name: { $first: "$food.name" },
          total_views: { $sum: 1 },
          likes: {
            $sum: {
              $cond: [{ $eq: ["$action", "like"] }, 1, 0],
            },
          },
          passes: {
            $sum: {
              $cond: [{ $eq: ["$action", "pass"] }, 1, 0],
            },
          },
        },
      },
      {
        $addFields: {
          conversion_rate: {
            $cond: [
              { $eq: ["$total_views", 0] },
              0,
              {
                $round: [
                  {
                    $multiply: [{ $divide: ["$likes", "$total_views"] }, 100],
                  },
                  2,
                ],
              },
            ],
          },
        },
      },
      {
        $project: {
          _id: 0,
          food_id: "$_id",
          food_name: 1,
          total_views: 1,
          likes: 1,
          passes: 1,
          conversion_rate: 1,
        },
      },
      {
        $sort: { total_views: -1, food_name: 1 },
      },
    ]

    const rows = (await UserSwipeModel.aggregate(pipeline)) as AnalyticsRow[]
    const items = rows.map((row) => ({
      foodId: String(row.food_id),
      foodName: row.food_name,
      totalViews: row.total_views,
      likes: row.likes,
      passes: row.passes,
      conversionRate: row.conversion_rate,
    }))

    res.status(200).json({ items })
  } catch (error) {
    next(error)
  }
})
