import { Injectable, UnauthorizedException } from "@nestjs/common"
import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import type { ConfigService } from "@nestjs/config"
import type { AuthService } from "../auth.service"
import type { JwtPayload } from "../interfaces/jwt-payload.interface"
import type { User } from "../../users/entities/user.entity"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_SECRET"),
    })
  }

  /**
   * Validate the JWT payload and return the user
   */
  async validate(payload: JwtPayload): Promise<User> {
    // Reject refresh tokens when used for access
    if (payload.tokenType === "refresh") {
      throw new UnauthorizedException("Invalid token type")
    }

    return this.authService.validateUser(payload)
  }
}
