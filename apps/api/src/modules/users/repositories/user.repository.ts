import { UserModel, type UserDocument } from './user.model';
import type { CreateUserInput } from '../types/user.types';

export const userRepository = {
  async findByEmail(email: string): Promise<UserDocument | null> {
    return UserModel.findOne({ email: email.toLowerCase() });
  },

  async findById(id: string): Promise<UserDocument | null> {
    return UserModel.findById(id);
  },

  async create(input: CreateUserInput): Promise<UserDocument> {
    return UserModel.create({
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
    });
  },
};
