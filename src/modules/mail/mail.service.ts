import { Injectable } from '@nestjs/common'
import { MailerService } from '@nestjs-modules/mailer'

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendPasswordResetEmail(to: string, token: string) {
    await this.mailerService.sendMail({
      to,
      subject: 'Redefinição de senha',
      template: 'forgot-password', // Name of the template file (forgot-password.hbs)
      context: {
        url: `http://localhost:3000/reset-password?token=${token}`, // Pass the reset URL to the template
      },
    })
  }
}
