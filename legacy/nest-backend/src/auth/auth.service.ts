import { Injectable, UnauthorizedException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { UsersService } from "../users/users.service"
import type { User } from "../users/entities/user.entity"
import type { JwtPayload } from "./interfaces/jwt-payload.interface"
import type { RefreshTokenDto } from "./dto/refresh-token.dto"

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Generate access token for a user
   */
  async generateAccessToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      provider: user.musicProvider,
    }

    return this.jwtService.sign(payload)
  }

  /**
   * Generate refresh token for a user (with longer expiry)
   */
  async generateRefreshToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      provider: user.musicProvider,
      tokenType: "refresh",
    }

    // Refresh token lasts longer (7 days)
    return this.jwtService.sign(payload, { expiresIn: "7d" })
  }

  /**
   * Generate both access and refresh tokens
   */
  async generateTokens(user: User): Promise<{ accessToken: string; refreshToken: string }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.generateAccessToken(user),
      this.generateRefreshToken(user),
    ])

    return {
      accessToken,
      refreshToken,
    }
  }

  /**
   * Validate a user by JWT payload
   */
  async validateUser(payload: JwtPayload): Promise<User> {
    const user = await this.usersService.findOne(payload.sub)

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    return user
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{ accessToken: string }> {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken)

      // Check if it's actually a refresh token
      if (payload.tokenType !== "refresh") {
        throw new UnauthorizedException("Invalid refresh token")
      }

      // Get the user
      const user = await this.usersService.findOne(payload.sub)

      // Generate a new access token
      const accessToken = await this.generateAccessToken(user)

      return { accessToken }
    } catch (error) {
      throw new UnauthorizedException("Invalid refresh token")
    }
  }
}
