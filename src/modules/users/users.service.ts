import { Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'
import { PrismaService } from 'src/prisma.service'
import { paginate, paginateOutput } from 'src/utils/pagination.utils'
import { CreateUserDTO, UpdateUserDTO, UserFullDTO, UserListItemDTO } from './user.dto'

@Injectable()
export class UsersService {
  constructor(private prismaService: PrismaService) {}

  async findById(userId: string) {
    return this.prismaService.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        createdProjects: {
          select: {
            id: true,
            description: true,
            name: true,
          },
        },
      },
    })
  }

  async findByEmail(email: string) {
    return this.prismaService.user.findFirst({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        role: true,
        password: true,
      },
    })
  }

  async FindAll(query?: QueryPaginationDTO) {
    const users = await this.prismaService.user.findMany({
      ...paginate(query),
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        updatedAt: true,
        role: true,
      },
    })

    const total = await this.prismaService.user.count()

    return paginateOutput<UserListItemDTO>(users, total, query)
  }

  async create(data: CreateUserDTO) {
    return this.prismaService.user.create({
      data,
    })
  }

  async update(id: string, data: UpdateUserDTO) {
    return await this.prismaService.user.update({
      where: {
        id,
      },
      data,
    })
  }

  async delete(id: string) {
    return this.prismaService.user.delete({
      where: {
        id,
      },
    })
  }
}
