import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { CommentsService } from './comments.service'

describe('CommentsService', () => {
  let service: CommentsService
  let prisma: {
    comment: {
      findMany: jest.Mock
      count: jest.Mock
      findFirst: jest.Mock
      create: jest.Mock
      update: jest.Mock
      delete: jest.Mock
    }
  }
  let requestContext: { getUserId: jest.Mock }

  const mockComment = {
    id: 'comment-1',
    taskId: 'task-1',
    authorId: 'user-1',
    content: 'Nice work!',
    createdAt: new Date(),
    updatedAt: new Date(),
    author: {
      id: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: null,
    },
  }

  const mockComments = Array.from({ length: 10 }, (_, i) => ({
    ...mockComment,
    id: `comment-${i}`,
  }))

  const query = { page: '1', size: '10' }

  beforeEach(async () => {
    prisma = {
      comment: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }
    requestContext = {
      getUserId: jest.fn().mockReturnValue('user-1'),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        { provide: PrismaService, useValue: prisma },
        { provide: RequestContextService, useValue: requestContext },
      ],
    }).compile()

    service = module.get<CommentsService>(CommentsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAllByTask', () => {
    it('should return a paginated list of comments for a task', async () => {
      prisma.comment.findMany.mockResolvedValue(mockComments)
      prisma.comment.count.mockResolvedValue(mockComments.length)

      const result = await service.findAllByTask('task-1', query)

      expect(prisma.comment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { taskId: 'task-1' } }),
      )
      expect(prisma.comment.count).toHaveBeenCalledWith({ where: { taskId: 'task-1' } })
      expect(result).toEqual(paginateOutput(mockComments, mockComments.length, query))
    })
  })

  describe('findById', () => {
    it('should return a comment by task id and comment id', async () => {
      prisma.comment.findFirst.mockResolvedValue(mockComment)

      const result = await service.findById('task-1', 'comment-1')

      expect(prisma.comment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'comment-1', taskId: 'task-1' } }),
      )
      expect(result).toEqual(mockComment)
    })
  })

  describe('create', () => {
    it('should create a comment with the current user as author', async () => {
      prisma.comment.create.mockResolvedValue(mockComment)

      const result = await service.create('task-1', { content: 'Nice work!' })

      expect(prisma.comment.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { content: 'Nice work!', authorId: 'user-1', taskId: 'task-1' },
        }),
      )
      expect(result).toEqual(mockComment)
    })

    it('should throw BadRequestException when create fails', async () => {
      prisma.comment.create.mockRejectedValue(new Error('prisma error'))

      await expect(service.create('task-1', { content: 'Nice work!' })).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('update', () => {
    it('should update an existing comment', async () => {
      prisma.comment.findFirst.mockResolvedValue(mockComment)
      prisma.comment.update.mockResolvedValue({
        ...mockComment,
        content: 'Updated content',
      })

      const result = await service.update('task-1', 'comment-1', { content: 'Updated content' })

      expect(prisma.comment.findFirst).toHaveBeenCalled()
      expect(prisma.comment.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'comment-1' },
          data: { content: 'Updated content' },
        }),
      )
      expect(result).toEqual({ ...mockComment, content: 'Updated content' })
    })

    it('should throw NotFoundException when comment does not exist', async () => {
      prisma.comment.findFirst.mockResolvedValue(null)

      await expect(
        service.update('task-1', 'comment-1', { content: 'Updated content' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('should remove a comment owned by the current user', async () => {
      prisma.comment.findFirst.mockResolvedValue(mockComment)
      prisma.comment.delete.mockResolvedValue(mockComment)

      const result = await service.remove('task-1', 'comment-1')

      expect(prisma.comment.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'comment-1', taskId: 'task-1', authorId: 'user-1' },
        }),
      )
      expect(prisma.comment.delete).toHaveBeenCalled()
      expect(result).toEqual(mockComment)
    })

    it('should throw NotFoundException when comment does not exist', async () => {
      prisma.comment.findFirst.mockResolvedValue(null)

      await expect(service.remove('task-1', 'comment-1')).rejects.toThrow(NotFoundException)
    })
  })
})
