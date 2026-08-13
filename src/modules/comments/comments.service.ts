import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginate, paginateOutput } from 'src/utils/pagination.utils'
import { CommentListItemDTO, CommentRequestDTO } from './comments.dto'

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

  async findAllByTask(taskId: string, query?: QueryPaginationDTO) {
    const comments = await this.prisma.comment.findMany({
      ...paginate(query),
      where: {
        taskId: taskId,
      },
      include: { ...authorAttributes },
    })

    const total = await this.prisma.comment.count({
      where: {
        taskId: taskId,
      },
    })

    return paginateOutput<CommentListItemDTO>(comments, total, query)
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
