import { Injectable } from '@nestjs/common'
import { ColaborattorRole, Role } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { CreateProjectRequestDTO, UpdateProjectDTO } from './project.dto'

@Injectable()
export class ProjectsService {
  constructor(private readonly prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.project.findMany()
  }

  findById(id: string) {
    return this.prismaService.project.findUnique({
      where: {
        id: id,
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

  async create(data: CreateProjectRequestDTO) {
    const project = await this.prismaService.project.create({
      data,
    })
    await this.prismaService.projectCollaborator.create({
      data: { projectId: project.id, userId: data.createdById, role: ColaborattorRole.OWNER },
    })
  }

  update(id: string, data: UpdateProjectDTO) {
    try {
      return this.prismaService.project.update({
        where: {
          id,
        },
        data,
      })
    } catch (error) {
      console.error('Error updating project:', error)
    }
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
