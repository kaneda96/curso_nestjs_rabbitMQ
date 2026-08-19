import 'dotenv/config'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  //versioning
  app.enableVersioning({
    type: VersioningType.URI,
  })

  //documentation
  const swagger = new DocumentBuilder()
    .setTitle('NestJS RabbitMQ')
    .setDescription('The NestJS RabbitMQ API description')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'jwt',
    )
    .addTag('nestjs', 'rabbitmq')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, swagger)
  SwaggerModule.setup('api', app, documentFactory())

  //Habilitar Microserviços
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL as string],
      queue: process.env.RABBITMQ_QUEUE as string,
      queueOptions: {
        durable: true,
      },
    },
  })

  //CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://127.0.0.1'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'UPDATE', 'DELETE', 'OPTIONS'],
  })

  //validators
  app.useGlobalPipes(new ValidationPipe())

  //inicia os microserviços (conecta ao RabbitMQ e escuta a fila)
  await app.startAllMicroservices()

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
