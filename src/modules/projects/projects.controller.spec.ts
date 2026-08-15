import { Test, TestingModule } from '@nestjs/testing'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { mockedProjects, mockPaginationQuery } from './project.mock'
import { ProjectsController } from './projects.controller'
import { ProjectsModule } from './projects.module'
import { ProjectsService } from './projects.service'

describe('ProjectsController', () => {
  let controller: ProjectsController
  let service: ProjectsService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ProjectsModule],
    })
      .overrideProvider(ProjectsService)
      .useValue(service)
      .overrideProvider(PrismaService)
      .useValue({ $connect: jest.fn() })
      .overrideProvider(RequestContextService)
      .useValue({ getUserId: jest.fn().mockReturnValue('user-1') })
      .compile()

    controller = module.get<ProjectsController>(ProjectsController)
    service = module.get<ProjectsService>(ProjectsService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  it('should return paginated list of projects', async () => {
    const mockedResponse = paginateOutput(
      mockedProjects,
      mockedProjects.length,
      mockPaginationQuery,
    )
    jest.spyOn(service, 'findAll').mockResolvedValue(mockedResponse)

    const result = await controller.findAll()

    expect(result).toEqual(mockedResponse)
    expect(service.findAll).toHaveBeenCalledTimes(1)
  })

  it('should return project by id', async () => {
    const project = mockedProjects[0]
    const expectResult = {
      ...project,
      task: [],
    }

    jest.spyOn(service, 'findById').mockResolvedValue(expectResult)

    const result = await controller.findById(project.id)

    expect(result).toEqual(expectResult)
    expect(service.findById).toHaveBeenCalledTimes(1)
  })

  it('should create aproject', async () => {
    const project = mockedProjects[0]
    jest.spyOn(service, 'create').mockResolvedValue(project)
    const result = await controller.create({
      description: project.description as string,
      name: project.name,
    })

    expect(result).toEqual(project)
    expect(service.create).toHaveBeenCalledTimes(1)
  })

  it('should be able to validate to handle validation errors', async () => {
    const error = new Error('Name required')

    jest.spyOn(service, 'create').mockRejectedValue(error)

    await expect(controller.create({ name: '', description: '' })).rejects.toThrow('Name required')
  })

  it('should be able to update project', async () => {
    const project = { ...mockedProjects[0], task: [] }
    jest.spyOn(service, 'update').mockResolvedValue(project)
    const result = await controller.update(project.id, {
      name: project.name,
      description: project.description as string,
    })

    expect(result).toEqual(project)
    expect(service.update).toHaveBeenCalledTimes(1)
  })

  it('should be able to remove project', async () => {
    const project = mockedProjects[0]
    jest.spyOn(service, 'delete').mockImplementation()
    await controller.delete(project.id)
    expect(service.delete).toHaveBeenCalledTimes(1)
  })
})
