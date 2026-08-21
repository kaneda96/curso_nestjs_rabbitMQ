import { Test, TestingModule } from '@nestjs/testing'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { ValidateResourcesIdInterceptor } from 'src/interceptors/validate-resources-id/validate-resources-id.interceptor'
import { PrismaService } from 'src/prisma.service'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'

describe('TasksController', () => {
  let controller: TasksController
  let tasksService: {
    findMany: jest.Mock
    findById: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }

  const mockTask = {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Implement tests',
    description: 'Write unit tests',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    tasksService = {
      findMany: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: tasksService },
        {
          provide: RequestContextService,
          useValue: { getUserId: jest.fn().mockReturnValue('user-1') },
        },
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

    controller = module.get<TasksController>(TasksController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return all tasks of a project', () => {
    const result = { data: [], meta: {} }
    const query = { page: '1', size: '10' }
    tasksService.findMany.mockReturnValue(result)

    expect(controller.findAllByProject('project-1', query)).toEqual(result)
    expect(tasksService.findMany).toHaveBeenCalledWith('project-1', query)
  })

  it('should return a task by id', () => {
    tasksService.findById.mockReturnValue(mockTask)

    expect(controller.findById('project-1', 'task-1')).toEqual(mockTask)
    expect(tasksService.findById).toHaveBeenCalledWith('task-1', 'project-1')
  })

  it('should create a task', () => {
    const data = { title: 'New task', description: 'Task description' }
    tasksService.create.mockReturnValue(mockTask)

    expect(controller.create('project-1', data)).toEqual(mockTask)
    expect(tasksService.create).toHaveBeenCalledWith('project-1', data)
  })

  it('should update a task', () => {
    const data = { title: 'Updated task' }
    tasksService.update.mockReturnValue({ ...mockTask, ...data })

    expect(controller.update('project-1', 'task-1', data)).toEqual({ ...mockTask, ...data })
    expect(tasksService.update).toHaveBeenCalledWith('project-1', 'task-1', data)
  })

  it('should delete a task', async () => {
    tasksService.delete.mockResolvedValue(mockTask)

    await controller.delete('project-1', 'task-1')

    expect(tasksService.delete).toHaveBeenCalledWith('project-1', 'task-1')
  })
})
