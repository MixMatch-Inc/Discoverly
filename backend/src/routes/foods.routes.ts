import { Router } from "express"
import { z } from "zod"
import { RestaurantModel } from "../models/index.js"

const querySchema = z.object({
  longitude: z.coerce.number(),
  latitude: z.coerce.number(),
  cursor: z.string().optional(),
})

const PAGE_SIZE = 10
const DISCOVERY_RADIUS_METERS = 10_000

type DiscoveryRow = {
  food_id: unknown
  restaurant_id: unknown
  food_name: string
  description: string
  price: number
  image_url: string
  restaurant_name: string
  distance_meters: number
}

function decodeCursor(cursor?: string): number {
  if (!cursor) {
    return 0
  }

  try {
    const raw = Buffer.from(cursor, "base64").toString("utf8")
    const parsed = Number(raw)
    if (!Number.isFinite(parsed) || parsed < 0) {
      return 0
    }
    return parsed
  } catch {
    return 0
  }
}

function encodeCursor(offset: number): string {
  return Buffer.from(String(offset), "utf8").toString("base64")
}

export const foodsRouter = Router()

foodsRouter.get("/discover", async (req, res, next) => {
  try {
    const query = querySchema.parse(req.query)
    const skip = decodeCursor(query.cursor)

    const pipeline = [
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [query.longitude, query.latitude],
          },
          distanceField: "distance_meters",
          spherical: true,
          maxDistance: DISCOVERY_RADIUS_METERS,
          query: { is_active: true },
        },
      },
      {
        $lookup: {
          from: "fooditems",
          localField: "_id",
          foreignField: "restaurant_id",
          as: "foods",
        },
      },
      {
        $unwind: "$foods",
      },
      {
        $match: {
          "foods.is_active": true,
        },
      },
      {
        $project: {
          food_id: "$foods._id",
          restaurant_id: "$_id",
          food_name: "$foods.name",
          description: "$foods.description",
          price: "$foods.price",
          image_url: "$foods.image_url",
          restaurant_name: "$name",
          distance_meters: 1,
        },
      },
      { $skip: skip },
      { $limit: PAGE_SIZE + 1 },
    ]

    const rows = (await RestaurantModel.aggregate(pipeline)) as DiscoveryRow[]
    const hasMore = rows.length > PAGE_SIZE
    const items = rows.slice(0, PAGE_SIZE).map((row) => ({
      id: String(row.food_id),
      restaurantId: String(row.restaurant_id),
      name: row.food_name,
      description: row.description,
      price: row.price,
      imageUrl: row.image_url,
      restaurantName: row.restaurant_name,
      distanceMeters: row.distance_meters,
    }))

    res.status(200).json({
      items,
      cursor: hasMore ? encodeCursor(skip + PAGE_SIZE) : null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid query parameters",
        details: error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
          code: issue.code,
        })),
      })
      return
    }
    next(error)
  }
})
