import { Test, TestingModule } from '@nestjs/testing'
import { TaskPriority, TaskStatus } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { TasksService } from './tasks.service'

describe('TasksService', () => {
  let service: TasksService
  let prismaService: {
    task: {
      findMany: jest.Mock
      count: jest.Mock
      findFirst: jest.Mock
      create: jest.Mock
      update: jest.Mock
      delete: jest.Mock
    }
  }

  const mockTask = {
    id: 'task-1',
    projectId: 'project-1',
    title: 'Implement tests',
    description: 'Write unit tests',
    status: TaskStatus.TODO,
    priority: TaskPriority.MEDIUM,
    dueDate: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockTasks = Array.from({ length: 10 }, (_, i) => ({
    ...mockTask,
    id: `task-${i}`,
  }))

  const query = { page: '1', size: '10' }

  beforeEach(async () => {
    prismaService = {
      task: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: prismaService }],
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findMany', () => {
    it('should return a paginated list of tasks for a project', async () => {
      prismaService.task.findMany.mockResolvedValue(mockTasks)
      prismaService.task.count.mockResolvedValue(mockTasks.length)

      const result = await service.findMany('project-1', query)

      expect(prismaService.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { projectId: 'project-1' } }),
      )
      expect(prismaService.task.count).toHaveBeenCalledWith({
        where: { projectId: 'project-1' },
      })
      expect(result).toEqual(paginateOutput(mockTasks, mockTasks.length, query))
    })
  })

  describe('findById', () => {
    it('should return a task by id and project id', async () => {
      prismaService.task.findFirst.mockResolvedValue(mockTask)

      const result = await service.findById('task-1', 'project-1')

      expect(prismaService.task.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'task-1', projectId: 'project-1' } }),
      )
      expect(result).toEqual(mockTask)
    })
  })

  describe('create', () => {
    it('should create a task linked to the project', async () => {
      const data = {
        title: 'New task',
        description: 'Task description',
        assigneeId: 'user-2',
      }
      prismaService.task.create.mockResolvedValue(mockTask)

      const result = await service.create('project-1', data)

      expect(prismaService.task.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { ...data, projectId: 'project-1' } }),
      )
      expect(result).toEqual(mockTask)
    })
  })

  describe('update', () => {
    it('should update a task', async () => {
      const data = {
        title: 'Updated task',
        description: 'Task description',
        assigneeId: 'user-2',
      }
      prismaService.task.update.mockResolvedValue({ ...mockTask, ...data })

      const result = await service.update('project-1', 'task-1', data)

      expect(prismaService.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: 'project-1', id: 'task-1' },
          data: { ...data, projectId: 'project-1' },
        }),
      )
      expect(result).toEqual({ ...mockTask, ...data })
    })
  })

  describe('delete', () => {
    it('should delete a task', async () => {
      prismaService.task.delete.mockResolvedValue(mockTask)

      const result = await service.delete('project-1', 'task-1')

      expect(prismaService.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1', projectId: 'project-1' },
      })
      expect(result).toEqual(mockTask)
    })
  })
})
