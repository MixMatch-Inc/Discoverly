import { InferSchemaType, Schema, model } from "mongoose"

export const userRoles = ["user", "restaurant", "admin"] as const
export type UserRole = (typeof userRoles)[number]

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password_hash: {
      type: String,
      required: true,
    },
    stellar_wallet: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: userRoles,
      default: "user",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
)

export type UserDocument = InferSchemaType<typeof userSchema>
export const UserModel = model<UserDocument>("User", userSchema)
