import type { UserRole } from "../models/user.model.js"

export type JwtPayload = {
  sub: string
  role: UserRole
}

export type AuthUser = {
  id: string
  role: UserRole
}
