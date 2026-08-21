import { BadRequestException, Injectable } from '@nestjs/common'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'
import { PrismaService } from 'src/prisma.service'
import { paginate, paginateOutput } from 'src/utils/pagination.utils'
import {
  AddCollaboratorDTO,
  CollaboratorListItemDTO,
  UpdateCollaboratorDTO,
} from './collaborators.dto'

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

  async findAllByProject(projectId: string, query?: QueryPaginationDTO) {
    const collaborators = await this.prisma.projectCollaborator.findMany({
      ...paginate(query),
      where: {
        projectId: projectId,
      },
      include: userAttributes,
    })

    const total = await this.prisma.projectCollaborator.count({
      where: {
        projectId: projectId,
      },
    })

    return paginateOutput<CollaboratorListItemDTO>(collaborators, total, query)
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

    await this.prisma.projectCollaborator.delete({
      where: {
        userId_projectId: {
          projectId,
          userId,
        },
      },
    })
  }
}
