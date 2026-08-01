import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { User } from '@prisma/client'
import { AuthenticatedUser } from 'src/common/decorators/authenticated-user/authenticated-user.decorator'
import { SignInDTO, SignUpDTO } from './auth.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signUp')
  async signUp(@Body() data: SignUpDTO) {
    return { token: await this.authService.signUp(data) }
  }

  @Post('signIn')
  @HttpCode(HttpStatus.OK)
  async signIn(@Body() data: SignInDTO) {
    return this.authService.signIn(data)
  }

  @Get('protected')
  @UseGuards(AuthGuard('jwt'))
  protected(@AuthenticatedUser() user: User) {
    return `autenticated ${user.email} `
  }

  @Post('forgot-password')
  async forgotPassword(@Body() { email }: { email: string }) {
    return await this.authService.forgotPassword(email)
  }

  @Post('reset-password')
  async resetPassword(@Body() { token, newPassword }: { token: string; newPassword: string }) {
    return await this.authService.resetPassword(token, newPassword)
  }
}
