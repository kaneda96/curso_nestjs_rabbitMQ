import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { SignInDTO, SignUpDTO } from './auth.dto'
import { AuthService } from './auth.service'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
