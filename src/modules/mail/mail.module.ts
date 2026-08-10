import path from 'node:path'
import { Module } from '@nestjs/common'
import { ClientsModule, Transport } from '@nestjs/microservices'
import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/adapters/handlebars.adapter'
import { EMAIL_SERVICE } from 'src/consts'
import { MailConsumer } from './mail.consumer'
import { MailService } from './mail.service'

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      defaults: {
        from: `"No Reply" <${process.env.MAIL_FROM}>`,
      },
      template: {
        dir: path.join(__dirname, 'templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ClientsModule.register([
      {
        name: EMAIL_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL as string],
          queue: process.env.RABBITMQ_QUEUE as string,
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
  ],
  exports: [MailService, ClientsModule],
  providers: [MailService],
  controllers: [MailConsumer],
})
export class MailModule {}
