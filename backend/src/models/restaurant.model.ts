import { InferSchemaType, Schema, Types, model } from "mongoose"

const geoPointSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
      validate: {
        validator: (value: number[]) => value.length === 2,
        message: "coordinates must be [longitude, latitude]",
      },
    },
  },
  { _id: false },
)

const restaurantSchema = new Schema(
  {
    owner_user_id: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: geoPointSchema,
      required: true,
    },
    stellar_wallet: {
      type: String,
      default: null,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

restaurantSchema.index({ location: "2dsphere" })

export type RestaurantDocument = InferSchemaType<typeof restaurantSchema>
export const RestaurantModel = model<RestaurantDocument>("Restaurant", restaurantSchema)
