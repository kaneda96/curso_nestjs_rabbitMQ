import { BadRequestException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { ColaborattorRole } from '@prisma/client'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { CollaboratorsService } from './collaborators.service'

describe('CollaboratorsService', () => {
  let service: CollaboratorsService
  let prisma: {
    projectCollaborator: {
      findMany: jest.Mock
      count: jest.Mock
      create: jest.Mock
      update: jest.Mock
      findUnique: jest.Mock
      delete: jest.Mock
    }
  }

  const mockCollaborator = {
    id: 'collaborator-1',
    projectId: 'project-1',
    userId: 'user-2',
    role: ColaborattorRole.EDITOR,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: {
      id: 'user-2',
      name: 'Jane Doe',
      email: 'jane@example.com',
      avatar: null,
    },
  }

  const mockCollaborators = Array.from({ length: 10 }, (_, i) => ({
    ...mockCollaborator,
    id: `collaborator-${i}`,
    userId: `user-${i}`,
  }))

  const query = { page: '1', size: '10' }

  beforeEach(async () => {
    prisma = {
      projectCollaborator: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        delete: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [CollaboratorsService, { provide: PrismaService, useValue: prisma }],
    }).compile()

    service = module.get<CollaboratorsService>(CollaboratorsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAllByProject', () => {
    it('should return a paginated list of collaborators for a project', async () => {
      prisma.projectCollaborator.findMany.mockResolvedValue(mockCollaborators)
      prisma.projectCollaborator.count.mockResolvedValue(mockCollaborators.length)

      const result = await service.findAllByProject('project-1', query)

      expect(prisma.projectCollaborator.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { projectId: 'project-1' } }),
      )
      expect(prisma.projectCollaborator.count).toHaveBeenCalledWith({
        where: { projectId: 'project-1' },
      })
      expect(result).toEqual(paginateOutput(mockCollaborators, mockCollaborators.length, query))
    })
  })

  describe('create', () => {
    it('should add a collaborator to a project', async () => {
      const data = { userId: 'user-2', role: ColaborattorRole.EDITOR }
      prisma.projectCollaborator.create.mockResolvedValue(mockCollaborator)

      const result = await service.create('project-1', data)

      expect(prisma.projectCollaborator.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: { ...data, projectId: 'project-1' } }),
      )
      expect(result).toEqual(mockCollaborator)
    })
  })

  describe('update', () => {
    it('should update a collaborator role', async () => {
      const data = { role: ColaborattorRole.VIEWER }
      prisma.projectCollaborator.update.mockResolvedValue({ ...mockCollaborator, ...data })

      const result = await service.update('project-1', 'user-2', data)

      expect(prisma.projectCollaborator.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId_projectId: { projectId: 'project-1', userId: 'user-2' } },
          data,
        }),
      )
      expect(result).toEqual({ ...mockCollaborator, ...data })
    })
  })

  describe('delete', () => {
    it('should remove a collaborator', async () => {
      prisma.projectCollaborator.findUnique.mockResolvedValue(mockCollaborator)
      prisma.projectCollaborator.delete.mockResolvedValue(mockCollaborator)

      await service.delete('project-1', 'user-2')

      expect(prisma.projectCollaborator.delete).toHaveBeenCalled()
    })

    it('should throw BadRequestException when trying to remove the project owner', async () => {
      prisma.projectCollaborator.findUnique.mockResolvedValue({
        ...mockCollaborator,
        role: 'OWNER',
      })

      await expect(service.delete('project-1', 'user-2')).rejects.toThrow(BadRequestException)
      expect(prisma.projectCollaborator.delete).not.toHaveBeenCalled()
    })
  })
})
