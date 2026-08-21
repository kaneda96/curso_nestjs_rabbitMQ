import { ApiProperty } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator'

export class SignUpDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string

  @ApiProperty({ enum: Role, default: Role.ADMIN, required: false })
  @IsEnum(Role)
  @IsOptional()
  role?: Role = Role.ADMIN
}

export class SignInDTO {
  @ApiProperty({ description: 'User e-mail' })
  @IsNotEmpty()
  @IsEmail()
  email: string

  @ApiProperty({ description: 'User password' })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string
}

export class ForgotPasswordDTO {
  @ApiProperty({ description: 'User e-mail' })
  @IsNotEmpty()
  @IsEmail()
  email: string
}

export class ResetPasswordDTO {
  @ApiProperty({ description: 'Reset password token' })
  @IsNotEmpty()
  @IsString()
  token: string

  @ApiProperty({ description: 'Users new password', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  newPassword: string
}

export class ChangePasswordDTO {
  @ApiProperty({ description: 'Current Password' })
  @IsString()
  @IsNotEmpty()
  currentPassword: string

  @ApiProperty({ description: 'New password' })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  newPassword: string
}
