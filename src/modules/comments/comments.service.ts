import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateCommentDTO, UpdateCommentDTO } from './comments.dto'

const authorAttributes = {
  author: {
    select: {
      id: true,
      name: true,
      email: true,
      avatar: true,
    },
  },
}

const taskAttribute = {
  task: {
    select: {
      id: true,
      title: true,
      projectId: true,
    },
  },
}

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllByTask(taskId: string) {
    const teste = await this.prisma.comment.findMany({
      where: {
        taskId: taskId,
      },
      include: { ...authorAttributes },
    })
    return teste
  }

  findById(taskId: string, commentId: string) {
    return this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
      },
      include: { ...authorAttributes, ...taskAttribute },
    })
  }

  async create(taskId: string, data: CreateCommentDTO) {
    return await this.prisma.comment
      .create({
        data: {
          ...data,
          taskId,
        },
        include: authorAttributes,
      })
      .catch((reason) => {
        throw new BadRequestException(reason)
      })
  }

  async update(taskId: string, commentId: string, data: UpdateCommentDTO) {
    const existingComment = await this.findById(taskId, commentId)

    if (!existingComment) {
      throw new NotFoundException('Comment not found')
    }

    return this.prisma.comment.update({
      where: {
        id: existingComment.id,
      },
      data,
      include: authorAttributes,
    })
  }

  async remove(taskId: string, commentId: string) {
    const existingComment = await this.findById(taskId, commentId)

    if (!existingComment) {
      throw new NotFoundException('Comment not found')
    }

    return this.prisma.comment.delete({
      where: {
        id: existingComment.id,
      },
      include: authorAttributes,
    })
  }
}
