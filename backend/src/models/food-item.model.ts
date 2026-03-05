import { InferSchemaType, Schema, Types, model } from "mongoose"

const foodItemSchema = new Schema(
  {
    restaurant_id: {
      type: Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
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
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image_url: {
      type: String,
      required: true,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export type FoodItemDocument = InferSchemaType<typeof foodItemSchema>
export const FoodItemModel = model<FoodItemDocument>("FoodItem", foodItemSchema)
