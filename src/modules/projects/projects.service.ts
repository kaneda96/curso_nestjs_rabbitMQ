import { Injectable } from '@nestjs/common'
import { ColaborattorRole, Project } from '@prisma/client'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginate, paginateOutput } from 'src/utils/pagination.utils'
import { RequestProjectDTO } from './project.dto'

@Injectable()
export class ProjectsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly requestContexService: RequestContextService,
  ) {}

  async findAll(query?: QueryPaginationDTO) {
    const projects = await this.prismaService.project.findMany({
      ...paginate(query),
      where: {
        createdById: this.requestContexService.getUserId(),
      },
    })

    const total = await this.prismaService.project.count({
      where: {
        OR: [
          { createdById: this.requestContexService.getUserId() },
          { projectCollaborator: { some: { userId: this.requestContexService.getUserId() } } },
        ],
      },
    })
    return paginateOutput<Project>(projects, total, query)
  }

  findById(id: string) {
    return this.prismaService.project.findFirst({
      where: {
        id: id,
        createdById: this.requestContexService.getUserId(),
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            status: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    })
  }

  async create(data: RequestProjectDTO) {
    const userId = this.requestContexService.getUserId()

    const project = await this.prismaService.project.create({
      data: { ...data, createdById: userId },
    })

    await this.prismaService.projectCollaborator.create({
      data: {
        projectId: project.id,
        userId: userId,
        role: ColaborattorRole.OWNER,
      },
    })

    return project
  }

  update(id: string, data: RequestProjectDTO) {
    const userId = this.requestContexService.getUserId()
    return this.prismaService.project.update({
      where: {
        id,
      },
      data: { ...data, createdById: userId },
    })
  }

  async delete(id: string) {
    await this.prismaService.task.deleteMany({
      where: {
        projectId: id,
      },
    })
    return await this.prismaService.project.delete({
      where: {
        id: id,
      },
    })
  }
}
