import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { MailModule } from '../mail/mail.module'
import { MailService } from '../mail/mail.service'
import { UsersService } from '../users/users.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('AuthController', () => {
  let controller: AuthController
  let userService: UsersService
  let prismaService: PrismaService
  let authService: AuthService
  let jwtService: JwtService
  let requestContext: RequestContextService
  let mailModule: MailModule

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService, AuthService, JwtService, RequestContextService],
      imports: [MailModule],
      controllers: [AuthController],
    }).compile()

    authService = await module.resolve<AuthService>(AuthService)
    requestContext = await module.resolve<RequestContextService>(RequestContextService)
    controller = await module.resolve<AuthController>(AuthController)
    mailModule = await module.resolve<MailService>(MailService)
    userService = module.get<UsersService>(UsersService)
    prismaService = module.get<PrismaService>(PrismaService)
    jwtService = module.get<JwtService>(JwtService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
