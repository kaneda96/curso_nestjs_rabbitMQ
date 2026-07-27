import { ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
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
    .addTag('nestjs', 'rabbitmq')
    .build()

  const documentFactory = () => SwaggerModule.createDocument(app, swagger)
  SwaggerModule.setup('api', app, documentFactory())

  //validators
  app.useGlobalPipes(new ValidationPipe())

  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
