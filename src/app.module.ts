import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { RequestContextService } from './common/services/request-context/request-context.service'
import { AuthModule } from './modules/auth/auth.module'
import { CollaboratorsModule } from './modules/collaborators/collaborators.module'
import { CommentsModule } from './modules/comments/comments.module'
import { MailModule } from './modules/mail/mail.module'
import { ProjectsModule } from './modules/projects/projects.module'
import { TasksModule } from './modules/tasks/tasks.module'
import { TasksService } from './modules/tasks/tasks.service'
import { UsersModule } from './modules/users/users.module'
import { PrismaService } from './prisma.service'
import { CloudnaryService } from './common/services/cloudnary/cloudnary.service';

@Module({
  imports: [
    ProjectsModule,
    TasksModule,
    UsersModule,
    CollaboratorsModule,
    CommentsModule,
    AuthModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, TasksService, RequestContextService, CloudnaryService],
})
export class AppModule {}
