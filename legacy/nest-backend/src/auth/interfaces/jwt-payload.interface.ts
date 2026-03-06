import type { MusicProvider } from "@prisma/client"

export interface JwtPayload {
  sub: string // User ID
  provider: MusicProvider // Music provider
  tokenType?: string // Optional token type (for refresh tokens)
  iat?: number // Issued at (automatically added by JWT)
  exp?: number // Expiration time (automatically added by JWT)
}
