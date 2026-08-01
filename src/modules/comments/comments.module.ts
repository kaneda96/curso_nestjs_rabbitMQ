import { Module } from '@nestjs/common'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'

@Module({
  providers: [CommentsService, PrismaService, RequestContextService],
  controllers: [CommentsController],
})
export class CommentsModule {}
