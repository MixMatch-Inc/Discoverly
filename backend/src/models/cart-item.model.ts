import { InferSchemaType, Schema, Types, model } from "mongoose"

const cartItemSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },
    food_id: {
      type: Types.ObjectId,
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: ["active", "removed", "ordered"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

cartItemSchema.index(
  { user_id: 1, food_id: 1, status: 1 },
  { unique: true, partialFilterExpression: { status: "active" } },
)

export type CartItemDocument = InferSchemaType<typeof cartItemSchema>
export const CartItemModel = model<CartItemDocument>("CartItem", cartItemSchema)
