import type { NextFunction, Request, Response } from "express"
import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import type { JwtPayload } from "../types/auth.js"

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null

  if (!token) {
    res.status(401).json({
      error: "Unauthorized",
      message: "Missing bearer token",
    })
    return
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = {
      id: payload.sub,
      role: payload.role,
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload
    req.user = {
      id: decoded.sub,
      role: decoded.role,
    }
    next()
  } catch {
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
    })
  }
}
