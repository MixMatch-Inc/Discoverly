import type { AuthUser } from '@discoverly/shared';
import type { UserDocument } from '../repositories/user.model';

export function toAuthUser(user: UserDocument): AuthUser {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
