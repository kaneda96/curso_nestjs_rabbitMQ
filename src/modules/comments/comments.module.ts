import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'

@Module({
  providers: [CommentsService, PrismaService],
  controllers: [CommentsController],
})
export class CommentsModule {}
