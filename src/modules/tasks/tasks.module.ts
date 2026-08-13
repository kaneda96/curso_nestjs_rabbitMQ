import { Module } from '@nestjs/common'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'

@Module({
  providers: [TasksService, PrismaService, RequestContextService],
  controllers: [TasksController],
})
export class TasksModule {}
