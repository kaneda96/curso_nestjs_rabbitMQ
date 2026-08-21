import { Test, TestingModule } from '@nestjs/testing'
import { ValidateResourcesIdInterceptor } from 'src/interceptors/validate-resources-id/validate-resources-id.interceptor'
import { PrismaService } from 'src/prisma.service'
import { CommentsController } from './comments.controller'
import { CommentsService } from './comments.service'

describe('CommentsController', () => {
  let controller: CommentsController
  let service: {
    findAllByTask: jest.Mock
    findById: jest.Mock
    create: jest.Mock
    update: jest.Mock
    remove: jest.Mock
  }

  const mockComment = {
    id: 'comment-1',
    taskId: 'task-1',
    authorId: 'user-1',
    content: 'Nice work!',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    service = {
      findAllByTask: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        { provide: CommentsService, useValue: service },
        {
          provide: ValidateResourcesIdInterceptor,
          useValue: { intercept: jest.fn() },
        },
        {
          provide: PrismaService,
          useValue: {
            project: { findFirst: jest.fn() },
            task: { findFirst: jest.fn() },
          },
        },
      ],
    }).compile()

    controller = module.get<CommentsController>(CommentsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return all comments of a task', async () => {
    const result = { data: [], meta: {} }
    const query = { page: '1', size: '10' }
    service.findAllByTask.mockResolvedValue(result)

    await expect(controller.findAllByTask('task-1', query)).resolves.toEqual(result)
    expect(service.findAllByTask).toHaveBeenCalledWith('task-1', query)
  })

  it('should return a comment by id', () => {
    service.findById.mockReturnValue(mockComment)

    expect(controller.findOne('task-1', 'comment-1')).toEqual(mockComment)
    expect(service.findById).toHaveBeenCalledWith('task-1', 'comment-1')
  })

  it('should create a comment', () => {
    const data = { content: 'Nice work!' }
    service.create.mockReturnValue(mockComment)

    controller.create('task-1', data)

    expect(service.create).toHaveBeenCalledWith('task-1', data)
  })

  it('should update a comment', () => {
    const data = { content: 'Updated content' }
    service.update.mockReturnValue({ ...mockComment, ...data })

    expect(controller.update('task-1', 'comment-1', data)).toEqual({ ...mockComment, ...data })
    expect(service.update).toHaveBeenCalledWith('task-1', 'comment-1', data)
  })

  it('should delete a comment', async () => {
    service.remove.mockResolvedValue(mockComment)

    await expect(controller.delete('task-1', 'comment-1')).resolves.toEqual(mockComment)
    expect(service.remove).toHaveBeenCalledWith('task-1', 'comment-1')
  })
})
