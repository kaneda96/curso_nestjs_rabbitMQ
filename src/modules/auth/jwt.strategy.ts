import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET!,
    })
  }

  async validate(payload: { sub: string; purpose?: string }) {
    if (payload.purpose && payload.purpose === 'reset-password') {
      throw new UnauthorizedException('Invalid token for this route')
    }

    const user = this.prisma.user.findMany({
      where: {
        id: payload.sub,
      },
    })
    if (!user) return null
    return user
  }
}
