import type { NextFunction, Request, Response } from "express"

export function requireRole(allowedRoles: UserRole[]) {
import type { UserRole } from "../models/user.model.js"

export function requireRole(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      })
      return
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden",
        message: "Insufficient role permissions",
      })
      return
    }

    next()
  }
}
