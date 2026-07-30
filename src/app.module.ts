import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CollaboratorsModule } from './modules/collaborators/collaborators.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { TasksModule } from './modules/tasks/tasks.module'
import { TasksService } from './modules/tasks/tasks.service'
import { UsersModule } from './modules/users/users.module'
import { PrismaService } from './prisma.service'
import { CommentsModule } from './modules/comments/comments.module';

@Module({
  imports: [ProjectsModule, TasksModule, UsersModule, CollaboratorsModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, TasksService],
})
export class AppModule {}
