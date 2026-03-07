import { Router } from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { z } from "zod"
import { env } from "../config/env.js"
import { authenticate } from "../middleware/authenticate.middleware.js"
import { requireRole } from "../middleware/require-role.middleware.js"
import { UserModel, userRoles } from "../models/user.model.js"
import type { JwtPayload } from "../types/auth.js"

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "password must be at least 8 characters"),
  role: z.enum(userRoles).optional(),
  stellar_wallet: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const authRouter = Router()

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = registerSchema.parse(req.body)
    const existing = await UserModel.findOne({ email: body.email }).lean()
    if (existing) {
      res.status(409).json({
        error: "Conflict",
        message: "User already exists with this email",
      })
      return
    }

    const password_hash = await bcrypt.hash(body.password, 10)
    const user = await UserModel.create({
      email: body.email,
      password_hash,
      role: body.role ?? "user",
      stellar_wallet: body.stellar_wallet ?? null,
    })

    res.status(201).json({
      id: String(user._id),
      email: user.email,
      role: user.role,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Bad Request",
        message: "Validation failed",
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

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await UserModel.findOne({ email: body.email })

    if (!user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid credentials",
      })
      return
    }

    const passwordMatches = await bcrypt.compare(body.password, user.password_hash)
    if (!passwordMatches) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Invalid credentials",
      })
      return
    }

    const payload: JwtPayload = {
      sub: String(user._id),
      role: user.role,
    }

    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1h" })

    res.status(200).json({
      token,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: "Bad Request",
        message: "Validation failed",
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

authRouter.get("/me", authenticate, (req, res) => {
  res.status(200).json({
    user: req.user,
  })
})

authRouter.get(
  "/restaurant-zone",
  authenticate,
  requireRole(["restaurant", "admin"]),
  (_req, res) => {
    res.status(200).json({
      ok: true,
      scope: "restaurant-zone",
    })
  },
)
