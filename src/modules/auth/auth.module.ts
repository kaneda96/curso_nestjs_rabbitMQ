import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { MailModule } from '../mail/mail.module'
import { MailService } from '../mail/mail.service'
import { UsersService } from '../users/users.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JwtStrategy } from './jwt.strategy'

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '1d',
      },
    }),
    MailModule,
  ],
  providers: [
    AuthService,
    PrismaService,
    UsersService,
    JwtStrategy,
    RequestContextService,
    MailService,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
