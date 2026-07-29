import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'

@Module({
  providers: [TasksService, PrismaService],
  controllers: [TasksController],
})
export class TasksModule {}
