import { Injectable } from "@nestjs/common"
import type { PrismaService } from "../database/prisma.service"
import type { CreateUserDto } from "./dto/create-user.dto"
import type { UpdateUserDto } from "./dto/update-user.dto"
import { User } from "./entities/user.entity"

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = await this.prisma.user.create({
      data: createUserDto,
    })
    return new User(user)
  }

  async findAll(): Promise<User[]> {
    const users = await this.prisma.user.findMany()
    return users.map((user) => new User(user))
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })
    return user ? new User(user) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })
    return user ? new User(user) : null
  }

  async findByMusicId(musicId: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { musicId },
    })
    return user ? new User(user) : null
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    })
    return new User(user)
  }

  async remove(id: string): Promise<User> {
    const user = await this.prisma.user.delete({
      where: { id },
    })
    return new User(user)
  }
}
