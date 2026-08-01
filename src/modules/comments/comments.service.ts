import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { CommentRequestDTO } from './comments.dto'

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly requestContext: RequestContextService,
  ) {}

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

  async create(taskId: string, data: CommentRequestDTO) {
    return await this.prisma.comment
      .create({
        data: {
          ...data,
          authorId: this.requestContext.getUserId(),
          taskId,
        },
        include: authorAttributes,
      })
      .catch((reason) => {
        throw new BadRequestException(reason)
      })
  }

  async update(taskId: string, commentId: string, data: CommentRequestDTO) {
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
    const existingComment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        taskId,
        authorId: this.requestContext.getUserId(),
      },
    })

    if (!existingComment) {
      throw new NotFoundException('Comment not found')
    }

    return this.prisma.comment.delete({
      where: {
        id: existingComment.id,
        taskId,
        authorId: this.requestContext.getUserId(),
      },
      include: authorAttributes,
    })
  }
}
