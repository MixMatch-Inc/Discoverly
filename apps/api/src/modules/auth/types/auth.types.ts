import type { RegisterInput, LoginInput, AuthResponse } from '@discoverly/shared';

export type RegisterDto = RegisterInput;
export type LoginDto = LoginInput;
export type { AuthResponse };

export interface JwtPayload {
  sub: string;
  email: string;
}
