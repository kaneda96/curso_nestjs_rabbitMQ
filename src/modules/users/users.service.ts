import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateUserDTO, UpdateUserDTO } from './user.dto'

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

  async FindAll() {
    return this.prismaService.user.findMany({
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
  }

  async create(data: CreateUserDTO) {
    return this.prismaService.user.create({
      data,
    })
  }

  async update(id: string, data: UpdateUserDTO) {
    return this.prismaService.user.update({
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
