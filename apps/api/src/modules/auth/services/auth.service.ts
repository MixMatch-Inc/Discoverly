import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../../shared/config/env';
import { ConflictError, UnauthorizedError } from '../../../shared/errors/app-error';
import { userRepository } from '../../users/repositories/user.repository';
import { toAuthUser } from '../../users/services/user.service';
import type { AuthResponse, JwtPayload, LoginDto, RegisterDto } from '../types/auth.types';

const PASSWORD_SALT_ROUNDS = 10;

function signToken(payload: JwtPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export const authService = {
  async register(input: RegisterDto): Promise<AuthResponse> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
    const user = await userRepository.create({ email: input.email, passwordHash });

    const token = signToken({ sub: user.id, email: user.email });
    return { user: toAuthUser(user), token };
  },

  async login(input: LoginDto): Promise<AuthResponse> {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = signToken({ sub: user.id, email: user.email });
    return { user: toAuthUser(user), token };
  },
};
