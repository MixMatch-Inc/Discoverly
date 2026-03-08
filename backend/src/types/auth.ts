export const userRoles = ["user", "restaurant", "admin"] as const
export type UserRole = (typeof userRoles)[number]

export type JwtPayload = {
  sub: string
  role: UserRole
}

export type AuthUser = {
  id: string
  role: UserRole
}
