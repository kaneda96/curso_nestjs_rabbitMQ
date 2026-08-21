import { Test, TestingModule } from '@nestjs/testing'
import { EMAIL_SERVICE, SEND_PASSWORD_RESET_EMAIL_EVENT } from 'src/consts'
import { MailService } from './mail.service'

describe('MailService', () => {
  let service: MailService
  let client: { emit: jest.Mock }

  beforeEach(async () => {
    client = {
      emit: jest.fn().mockReturnValue({
        subscribe: jest.fn(),
      }),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService, { provide: EMAIL_SERVICE, useValue: client }],
    }).compile()

    service = module.get<MailService>(MailService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('should emit a password reset email event to the queue', async () => {
    const to = 'john@example.com'
    const token = 'reset-token'

    await service.sendPasswordResetEmail(to, token)

    expect(client.emit).toHaveBeenCalledWith(SEND_PASSWORD_RESET_EMAIL_EVENT, {
      email: to,
      url: `http://localhost:3000/reset-password?token=${token}`,
    })
  })
})
