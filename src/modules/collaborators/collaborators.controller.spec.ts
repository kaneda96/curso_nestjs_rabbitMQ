import { Test, TestingModule } from '@nestjs/testing'
import { ValidateResourcesIdInterceptor } from 'src/interceptors/validate-resources-id/validate-resources-id.interceptor'
import { PrismaService } from 'src/prisma.service'
import { CollaboratorsController } from './collaborators.controller'
import { CollaboratorsService } from './collaborators.service'

describe('CollaboratorsController', () => {
  let controller: CollaboratorsController
  let collaboratorsService: {
    findAllByProject: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }

  const mockCollaborator = {
    id: 'collaborator-1',
    projectId: 'project-1',
    userId: 'user-2',
    role: 'MEMBER',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    collaboratorsService = {
      findAllByProject: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollaboratorsController],
      providers: [
        { provide: CollaboratorsService, useValue: collaboratorsService },
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

    controller = module.get<CollaboratorsController>(CollaboratorsController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return all collaborators of a project', () => {
    const result = { data: [], meta: {} }
    const query = { page: '1', size: '10' }
    collaboratorsService.findAllByProject.mockReturnValue(result)

    expect(controller.findAllByProject('project-1', query)).toEqual(result)
    expect(collaboratorsService.findAllByProject).toHaveBeenCalledWith('project-1', query)
  })

  it('should add a collaborator', () => {
    const data = { userId: 'user-2', role: 'MEMBER' }
    collaboratorsService.create.mockReturnValue(mockCollaborator)

    expect(controller.create('project-1', data)).toEqual(mockCollaborator)
    expect(collaboratorsService.create).toHaveBeenCalledWith('project-1', data)
  })

  it('should update a collaborator', () => {
    const data = { role: 'ADMIN' }
    collaboratorsService.update.mockReturnValue({ ...mockCollaborator, ...data })

    expect(controller.update('project-1', 'user-2', data)).toEqual({
      ...mockCollaborator,
      ...data,
    })
    expect(collaboratorsService.update).toHaveBeenCalledWith('project-1', 'user-2', data)
  })

  it('should delete a collaborator', () => {
    collaboratorsService.delete.mockReturnValue(mockCollaborator)

    expect(controller.delete('project-1', 'user-2')).toEqual(mockCollaborator)
    expect(collaboratorsService.delete).toHaveBeenCalledWith('project-1', 'user-2')
  })
})
