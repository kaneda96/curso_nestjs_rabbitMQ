import { Injectable } from '@nestjs/common'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'
import { PrismaService } from 'src/prisma.service'
import { paginate, paginateOutput } from 'src/utils/pagination.utils'
import { TaskListItemDTO, TaskRequestDTO } from './task.dto'

@Injectable()
export class TasksService {
  constructor(private prismaService: PrismaService) {}

  async findMany(projectId: string, query?: QueryPaginationDTO) {
    const tasks = await this.prismaService.task.findMany({
      ...paginate(query),
      where: {
        projectId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        dueDate: true,
        createdAt: true,
        updatedAt: true,
        comments: true,
        assignedTo: {
          select: {
            avatar: true,
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const total = await this.prismaService.task.count({
      where: {
        projectId,
      },
    })

    return paginateOutput<TaskListItemDTO>(tasks, total, query)
  }

  async findById(taskId: string, projectId: string) {
    return this.prismaService.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
      include: {
        comments: {
          select: {
            author: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })
  }

  async create(projectId: string, data: TaskRequestDTO) {
    return this.prismaService.task.create({
      data: { ...data, projectId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })
  }

  async update(projectId: string, taskId: string, data: TaskRequestDTO) {
    return this.prismaService.task.update({
      where: {
        projectId,
        id: taskId,
      },
      data: { ...data, projectId },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })
  }

  async delete(projectId: string, taskId: string) {
    return await this.prismaService.task.delete({
      where: {
        id: taskId,
        projectId,
      },
    })
  }
}
