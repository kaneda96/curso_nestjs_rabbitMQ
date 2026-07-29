import { Injectable } from '@nestjs/common'
import { Task } from '@prisma/client'

import { PrismaService } from 'src/prisma.service'

@Injectable()
export class TasksService {
  constructor(private prismaService: PrismaService) {}

  findMany(projectId: string): Promise<Task[]> {
    return this.prismaService.task.findMany({
      where: {
        projectId,
      },
    })
  }

  async findById(taskId: string, projectId: string) {
    return this.prismaService.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
    })
  }

  async create(projectId: string, data: any) {
    return this.prismaService.task.create({ data: { ...data, projectId } })
  }

  async update(projectId: string, taskId: string, data: any) {
    return this.prismaService.task.update({
      where: {
        projectId,
        id: taskId,
      },
      data: { ...data },
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
