import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"
import { MusicProvider } from "@prisma/client"

export class CreateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string

  @IsNotEmpty()
  @IsString()
  displayName: string

  @IsEnum(MusicProvider)
  musicProvider: MusicProvider

  @IsNotEmpty()
  @IsString()
  musicId: string

  @IsNotEmpty()
  @IsString()
  accessToken: string

  @IsNotEmpty()
  @IsString()
  refreshToken: string
}
