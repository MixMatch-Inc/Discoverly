import { Injectable, NotFoundException, ConflictException } from "@nestjs/common"
import type { UsersRepository } from "./users.repository"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"
import type { User } from "./entities/user.entity"

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists with this email or musicId
    if (createUserDto.email) {
      const existingUserByEmail = await this.usersRepository.findByEmail(createUserDto.email)
      if (existingUserByEmail) {
        throw new ConflictException("User with this email already exists")
      }
    }

    const existingUserByMusicId = await this.usersRepository.findByMusicId(createUserDto.musicId)
    if (existingUserByMusicId) {
      throw new ConflictException("User with this music ID already exists")
    }

    return this.usersRepository.create(createUserDto)
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.findAll()
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne(id)
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return user
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email)
  }

  async findByMusicId(musicId: string): Promise<User | null> {
    return this.usersRepository.findByMusicId(musicId)
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.findOne(id)

    // Check for conflicts if updating email or musicId
    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const userWithEmail = await this.usersRepository.findByEmail(updateUserDto.email)
      if (userWithEmail && userWithEmail.id !== id) {
        throw new ConflictException("User with this email already exists")
      }
    }

    if (updateUserDto.musicId && updateUserDto.musicId !== existingUser.musicId) {
      const userWithMusicId = await this.usersRepository.findByMusicId(updateUserDto.musicId)
      if (userWithMusicId && userWithMusicId.id !== id) {
        throw new ConflictException("User with this music ID already exists")
      }
    }

    return this.usersRepository.update(id, updateUserDto)
  }

  async remove(id: string): Promise<User> {
    await this.findOne(id) // This will throw if user doesn't exist
    return this.usersRepository.remove(id)
  }
}
