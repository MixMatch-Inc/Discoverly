import { InferSchemaType, Schema, Types, model } from "mongoose"

const userSwipeSchema = new Schema(
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
    action: {
      type: String,
      enum: ["like", "pass"],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

userSwipeSchema.index({ user_id: 1, food_id: 1 }, { unique: true })

export type UserSwipeDocument = InferSchemaType<typeof userSwipeSchema>
export const UserSwipeModel = model<UserSwipeDocument>("UserSwipe", userSwipeSchema)
