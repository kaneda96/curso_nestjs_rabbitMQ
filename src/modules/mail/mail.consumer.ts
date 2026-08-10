import { Controller, Logger } from '@nestjs/common'
import { EventPattern, Payload } from '@nestjs/microservices'
import { MailerService } from '@nestjs-modules/mailer'
import { SEND_PASSWORD_RESET_EMAIL_EVENT } from 'src/consts'

@Controller()
export class MailConsumer {
  private readonly logger = new Logger(MailConsumer.name)

  constructor(private readonly mailer: MailerService) {}

  @EventPattern(SEND_PASSWORD_RESET_EMAIL_EVENT)
  async sendPasswordResetEmail(@Payload() data: { email: string; url: string }) {
    try {
      await this.mailer.sendMail({
        to: data.email,
        subject: 'Redefinição de senha',
        template: 'forgot-password',
        context: {
          url: data.url,
        },
      })
      this.logger.log(`E-mail de redefinição enviado para ${data.email}`)
    } catch (error) {
      this.logger.error(
        `Falha ao enviar e-mail para ${data.email}`,
        error instanceof Error ? error.stack : String(error),
      )
    }
  }
}
