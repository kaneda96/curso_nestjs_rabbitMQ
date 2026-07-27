import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { ProjectRequestDTO } from './project.dto'

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
    })
  }

  create(project: ProjectRequestDTO) {
    return this.prismaService.project.create({
      data: project,
    })
  }

  update(id: string, data: ProjectRequestDTO) {
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

  delete(id: string) {
    return this.prismaService.project.delete({
      where: {
        id: id,
      },
    })
  }
}
