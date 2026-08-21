import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from '../users/users.service'
import { AuthController } from './auth.controller'

describe('AuthController', () => {
  let controller: AuthController
  let userService: UsersService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService],
      controllers: [AuthController],
    }).compile()

    userService = module.get<UsersService>(UsersService)
    controller = module.get<AuthController>(AuthController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
