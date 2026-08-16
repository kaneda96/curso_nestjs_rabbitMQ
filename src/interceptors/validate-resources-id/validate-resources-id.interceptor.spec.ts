import { ExecutionContext, NotFoundException } from '@nestjs/common'
import { HttpArgumentsHost } from '@nestjs/common/interfaces'
import { Reflector } from '@nestjs/core'
import { Test, TestingModule } from '@nestjs/testing'
import { of } from 'rxjs'
import { VALIDATE_RESOURCES_IDS_KEY } from 'src/consts'
import { PrismaService } from 'src/prisma.service'
import { ValidateResourcesIdInterceptor } from './validate-resources-id.interceptor'

describe('ValidateResourcesIdInterceptor', () => {
  let interceptor: ValidateResourcesIdInterceptor
  let reflector: Reflector
  let prisma: PrismaService

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
    getHandler: jest.fn(),
  } as unknown as ExecutionContext

  const mockCallHandler = {
    handle: jest.fn(() => of()),
  }
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ValidateResourcesIdInterceptor,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            project: {
              findFirst: jest.fn(),
            },
            task: {
              findFirst: jest.fn(),
            },
          },
        },
      ],
    }).compile()

    interceptor = module.get<ValidateResourcesIdInterceptor>(ValidateResourcesIdInterceptor)
    reflector = module.get<Reflector>(Reflector)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should skip validation if decorator is not present', async () => {
    jest.spyOn(reflector, 'get').mockReturnValue(false)

    const result = await interceptor.intercept(mockExecutionContext, mockCallHandler)
    expect(reflector.get).toHaveBeenCalledWith(
      VALIDATE_RESOURCES_IDS_KEY,
      mockExecutionContext.getHandler(),
    )
    expect(result).toBeDefined()
    expect(prisma.project.findFirst).not.toHaveBeenCalled()
  })

  it('should validate project id and throw if project is not found', async () => {
    const mockRequest = {
      params: {
        projectId: 'project-id',
      },
    }

    jest.spyOn(reflector, 'get').mockReturnValue(true)
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as HttpArgumentsHost)

    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(null)

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler)).rejects.toThrow(
      NotFoundException,
    )
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'project-id',
      },
    })
  })

  it('should validate project id and project exists', async () => {
    const mockRequest = {
      params: {
        projectId: 'project-id',
      },
    }

    jest.spyOn(reflector, 'get').mockReturnValue(true)
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as HttpArgumentsHost)

    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue({ id: 'project-1' } as any)

    const result = await interceptor.intercept(mockExecutionContext, mockCallHandler)

    expect(result).toBeDefined()
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'project-id',
      },
    })
  })

  it('should validate task id and throw if task not found', async () => {
    const mockRequest = {
      params: {
        projectId: 'project-id',
        taskId: 'task-id',
      },
    }

    jest.spyOn(reflector, 'get').mockReturnValue(true)
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as HttpArgumentsHost)

    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue({ id: 'project-1' } as any)
    jest.spyOn(prisma.task, 'findFirst').mockResolvedValue(null)

    await expect(interceptor.intercept(mockExecutionContext, mockCallHandler)).rejects.toThrow(
      NotFoundException,
    )
    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'project-id',
      },
    })
    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: {
        projectId: 'project-id',
        id: 'task-id',
      },
    })
  })

  it('should validate task id and task exists', async () => {
    const mockRequest = {
      params: {
        projectId: 'project-id',
        taskId: 'task-id',
      },
    }

    jest.spyOn(reflector, 'get').mockReturnValue(true)
    jest.spyOn(mockExecutionContext, 'switchToHttp').mockReturnValue({
      getRequest: () => mockRequest,
    } as HttpArgumentsHost)

    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue({ id: 'project-1' } as any)
    jest.spyOn(prisma.task, 'findFirst').mockResolvedValue({ id: 'task-1' } as any)

    const result = await interceptor.intercept(mockExecutionContext, mockCallHandler)

    expect(prisma.project.findFirst).toHaveBeenCalledWith({
      where: {
        id: 'project-id',
      },
    })
    expect(prisma.task.findFirst).toHaveBeenCalledWith({
      where: {
        projectId: 'project-id',
        id: 'task-id',
      },
    })
  })
})
