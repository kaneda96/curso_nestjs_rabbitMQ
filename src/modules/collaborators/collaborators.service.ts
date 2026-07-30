import { BadRequestException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { AddCollaboratorDTO, UpdateCollaboratorDTO } from './collaborators.dto'

const userAttributes = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
}

@Injectable()
export class CollaboratorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAllByProject(projectId: string) {
    return this.prisma.projectCollaborator.findMany({
      where: {
        projectId: projectId,
      },
      include: userAttributes,
    })
  }

  create(projectId: string, data: AddCollaboratorDTO) {
    return this.prisma.projectCollaborator.create({
      data: { ...data, projectId },
      include: userAttributes,
    })
  }

  update(projectId: string, userId: string, data: UpdateCollaboratorDTO) {
    return this.prisma.projectCollaborator.update({
      where: {
        userId_projectId: {
          projectId,
          userId,
        },
      },
      data,
      include: userAttributes,
    })
  }

  async delete(projectId: string, userId: string) {
    const collaborator = await this.prisma.projectCollaborator.findUnique({
      where: {
        userId_projectId: { projectId, userId },
      },
    })

    if (collaborator?.role === 'OWNER') {
      throw new BadRequestException('The project owner can´t be removed')
    }

    this.prisma.projectCollaborator.delete({
      where: {
        userId_projectId: {
          projectId,
          userId,
        },
      },
    })
  }
}
