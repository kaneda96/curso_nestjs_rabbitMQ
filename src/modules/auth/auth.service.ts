import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { MailService } from '../mail/mail.service'
import { UsersService } from '../users/users.service'
import { ChangePasswordDTO, SignInDTO, SignUpDTO } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private readonly requestContexService: RequestContextService,
    private readonly mailService: MailService,
  ) {}
  async signUp(data: SignUpDTO) {
    const hash = await bcrypt.hash(data.password, 12)

    const newUser = await this.prismaService.user.create({
      data: { ...data, password: hash },
    })

    return this.jwtService.sign({ sub: newUser.id })
  }

  async signIn(data: SignInDTO) {
    const user = await this.userService.findByEmail(data.email)
    if (user && (await bcrypt.compare(data.password, user.password))) {
      this.requestContexService.setUser(user)
      return { token: this.jwtService.sign({ sub: user.id }) }
    }
    throw new UnauthorizedException()
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    const token = this.jwtService.sign(
      { sub: user.id, email: user.email, purpose: 'reset-password' },
      { expiresIn: '1h' },
    )

    await this.mailService.sendPasswordResetEmail(user.email, token)

    return { message: 'Password reset email sent' }
  }

  async changePassword(userId: string, data: ChangePasswordDTO) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const valid = await bcrypt.compare(data.currentPassword, user.password)

    if (!valid) {
      throw new UnauthorizedException('Current password is not valid')
    }

    const hash = await bcrypt.hash(data.newPassword, 12)

    return this.prismaService.user.update({
      where: { id: userId },
      data: { password: hash },
    })
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      })

      if (payload.purpose !== 'reset-password') {
        throw new UnauthorizedException('Invalid token for this route')
      }

      const user = await this.userService.findById(payload.sub)
      if (!user) {
        throw new UnauthorizedException('User not found')
      }

      const hashedPassword = await bcrypt.hash(newPassword, 12)
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })
      return { message: 'Password reset successful' }
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
