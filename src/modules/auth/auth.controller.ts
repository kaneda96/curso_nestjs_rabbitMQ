import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common'
import { ApiBearerAuth } from '@nestjs/swagger'
import type { User } from '@prisma/client'
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user/authenticated-user.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard'
import { UsersService } from '../users/users.service'
import { ChangePasswordDTO, SignInDTO, SignUpDTO } from './auth.dto'
import { AuthService } from './auth.service'

@Controller({ version: '1', path: 'auth' })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('signUp')
  @HttpCode(HttpStatus.OK)
  async signUp(@Body() data: SignUpDTO) {
    return { token: await this.authService.signUp(data) }
  }

  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() data: SignInDTO) {
    return this.authService.signIn(data)
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() { email }: { email: string }) {
    return await this.authService.forgotPassword(email)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() { token, newPassword }: { token: string; newPassword: string }) {
    return await this.authService.resetPassword(token, newPassword)
  }

  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  async changePassword(@AuthenticatedUser() user: User, @Body() data: ChangePasswordDTO) {
    return await this.authService.changePassword(user.id, data)
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  async me(@AuthenticatedUser() user: User) {
    const userData = await this.usersService.findById(user.id)
    if (!userData) {
      throw new NotFoundException()
    }
    return {
      id: userData.id,
      name: userData.name,
      avatar: userData.avatar,
      email: userData.email,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    }
  }
}
