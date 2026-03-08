import { Module } from "@nestjs/common"
import { UsersService } from "./users.service"
import { UsersRepository } from "./users.repository"
import { UsersController } from "./users.controller"

@Module({
  providers: [UsersService, UsersRepository],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
