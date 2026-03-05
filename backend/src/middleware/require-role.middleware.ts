import type { NextFunction, Request, Response } from "express"
import type { UserRole } from "../types/auth.js"

export function requireRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      })
      return
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: "Forbidden",
        message: "Insufficient role permissions",
      })
      return
    }

    next()
  }
}
