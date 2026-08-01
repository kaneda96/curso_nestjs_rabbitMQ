import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { UsersService } from '../users/users.service'
import { SignInDTO, SignUpDTO } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly userService: UsersService,
    private readonly requestContexService: RequestContextService,
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
}
