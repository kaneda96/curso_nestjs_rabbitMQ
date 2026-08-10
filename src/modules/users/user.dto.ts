import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateUserDTO {
  @ApiProperty({ description: 'User name', required: true })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({ description: 'User e-mail', required: true })
  @IsNotEmpty()
  @IsString()
  email: string

  @ApiProperty({ description: 'User password', minLength: 6, required: true })
  @IsNotEmpty()
  @IsString()
  password: string

  @ApiProperty({ description: 'User role', enum: Role, default: Role.ADMIN })
  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.ADMIN
}

export class UpdateUserDTO {
  @ApiProperty({ description: 'User name' })
  @IsString()
  @IsOptional()
  name?: string

  @ApiProperty({ description: 'avatar' })
  @IsString()
  @IsOptional()
  avatar?: string

  @ApiProperty({ description: 'User role', enum: Role, default: Role.ADMIN })
  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.ADMIN
}

export class UserListItemDTO {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() email: string
  @ApiProperty() avatar: string
  @ApiProperty() role: string
  @ApiProperty() createdAt: string
  @ApiProperty() updatedAt: string
}

export class UserProjectDTO {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty({ nullable: true, required: false }) description: string
}

export class UserFullDTO extends UserListItemDTO {
  @ApiProperty({ type: [UserProjectDTO] }) createdProjects: UserProjectDTO[]
}
