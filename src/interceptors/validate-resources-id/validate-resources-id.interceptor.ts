import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Observable } from 'rxjs'
import { VALIDATE_RESOURCES_IDS_KEY } from 'src/consts'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class ValidateResourcesIdInterceptor implements NestInterceptor {
  constructor(
    private readonly reflactor: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<Request>> {
    const shouldValidate = await this.reflactor.get(
      VALIDATE_RESOURCES_IDS_KEY,
      context.getHandler(),
    )

    if (!shouldValidate) {
      return next.handle()
    }

    const request = context.switchToHttp().getRequest()
    const projectId = request.params.projectId
    const taskId = request.params.taskId

    const project = await this.prisma.project.findFirst({
      where: {
        id: projectId,
      },
    })

    if (!project) {
      throw new NotFoundException('project not found')
    }

    if (taskId) {
      const task = await this.prisma.task.findFirst({
        where: {
          id: taskId,
        },
      })

      if (!task) {
        throw new NotFoundException('task not found')
      }
    }

    return next.handle()
  }
}
