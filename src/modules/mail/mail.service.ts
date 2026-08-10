import { Inject, Injectable, Logger } from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { EMAIL_SERVICE, SEND_PASSWORD_RESET_EMAIL_EVENT } from 'src/consts'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)

  constructor(@Inject(EMAIL_SERVICE) private readonly client: ClientProxy) {}

  async sendPasswordResetEmail(to: string, token: string) {
    const url = `http://localhost:3000/reset-password?token=${token}`
    this.client.emit(SEND_PASSWORD_RESET_EMAIL_EVENT, { email: to, url }).subscribe({
      error: (error) => {
        this.logger.error(`Falha ao publicar na fila para ${to}`, error)
      },
    })
  }
}
