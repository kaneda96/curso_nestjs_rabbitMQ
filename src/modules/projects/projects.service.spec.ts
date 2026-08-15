import { Test, TestingModule } from '@nestjs/testing'
import { Project } from '@prisma/client'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { mockedProjects, mockPaginationQuery } from './project.mock'
import { ProjectsService } from './projects.service'

describe('ProjectsService', () => {
  let service: ProjectsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: PrismaService,
          useValue: {
            project: {
              create: jest.fn(),
              findFirst: jest.fn(),
              findMany: jest.fn(),
              count: jest.fn(),
              delete: jest.fn(),
              update: jest.fn(),
            },
            projectCollaborator: {
              create: jest.fn(),
            },
            task: {
              deleteMany: jest.fn(),
            },
          },
        },
        {
          provide: RequestContextService,
          useValue: {
            getUserId: jest.fn().mockReturnValue('user-1'),
          },
        },
      ],
    }).compile()
    service = module.get<ProjectsService>(ProjectsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should be able to return a pagineted list of projects', async () => {
    expect(service).toBeDefined()
    jest.spyOn(prisma.project, 'findMany').mockResolvedValue(mockedProjects)
    jest.spyOn(prisma.project, 'count').mockResolvedValue(mockedProjects.length)

    const result = await service.findAll(mockPaginationQuery)

    expect(result).toEqual(
      paginateOutput<Project>(mockedProjects, mockedProjects.length, mockPaginationQuery),
    )
    expect(prisma.project.findMany).toHaveBeenCalledTimes(1)
  })

  it('should be able to return a project by Id', async () => {
    const project = mockedProjects[0]
    jest.spyOn(prisma.project, 'findFirst').mockResolvedValue(mockedProjects[0])

    const result = await service.findById(project.id)

    expect(result).toEqual(project)
  })

  it('should be able to create aproject', async () => {
    const project = mockedProjects[0]
    jest.spyOn(prisma.project, 'create').mockResolvedValue(project)

    const result = await service.create({
      name: project.name,
      description: project.description as string,
    })

    expect(result).toEqual(project)
    expect(prisma.project.create).toHaveBeenCalledTimes(1)
  })

  it('should be able to update project', async () => {
    const project = mockedProjects[0]

    jest.spyOn(prisma.project, 'update').mockResolvedValue({
      name: project.name,
      id: project.id,
      description: project.description as string,
      createdById: project.createdById,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    })

    await service.update(project.id, {
      name: project.name,
      description: project.description as string,
    })

    expect(prisma.project.update).toHaveBeenCalled()
  })

  it('should be able to remove project', async () => {
    const project = mockedProjects[0]

    jest.spyOn(prisma.project, 'delete').mockResolvedValue({
      name: project.name,
      id: project.id,
      description: project.description as string,
      createdById: project.createdById,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    })

    const result = await service.delete(project.id)

    expect(prisma.project.delete).toHaveBeenCalled()
    expect(prisma.task.deleteMany).toHaveBeenCalled()
  })
})
