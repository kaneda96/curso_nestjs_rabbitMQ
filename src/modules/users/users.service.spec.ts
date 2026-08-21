import { Test, TestingModule } from '@nestjs/testing'
import { PrismaService } from 'src/prisma.service'
import { paginateOutput } from 'src/utils/pagination.utils'
import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let prismaService: {
    user: {
      findFirst: jest.Mock
      findMany: jest.Mock
      count: jest.Mock
      create: jest.Mock
      update: jest.Mock
      delete: jest.Mock
    }
  }

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null,
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const mockUsers = Array.from({ length: 10 }, (_, i) => ({
    ...mockUser,
    id: `user-${i}`,
  }))

  const query = { page: '1', size: '10' }

  beforeEach(async () => {
    prismaService = {
      user: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: PrismaService, useValue: prismaService }],
    }).compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findById', () => {
    it('should return a user by id', async () => {
      prismaService.user.findFirst.mockResolvedValue(mockUser)

      const result = await service.findById('user-1')

      expect(result).toEqual(mockUser)
      expect(prismaService.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      )
    })
  })

  describe('findByEmail', () => {
    it('should return a user by email including password', async () => {
      prismaService.user.findFirst.mockResolvedValue({ ...mockUser, password: 'hashed' })

      const result = await service.findByEmail('john@example.com')

      expect(result).toEqual({ ...mockUser, password: 'hashed' })
      expect(prismaService.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { email: 'john@example.com' } }),
      )
    })
  })

  describe('FindAll', () => {
    it('should return a paginated list of users', async () => {
      prismaService.user.findMany.mockResolvedValue(mockUsers)
      prismaService.user.count.mockResolvedValue(mockUsers.length)

      const result = await service.FindAll(query)

      expect(prismaService.user.findMany).toHaveBeenCalledTimes(1)
      expect(prismaService.user.count).toHaveBeenCalledTimes(1)
      expect(result).toEqual(paginateOutput(mockUsers, mockUsers.length, query))
    })
  })

  describe('create', () => {
    it('should create a new user', async () => {
      const data = { name: 'John Doe', email: 'john@example.com', password: 'password123' }
      prismaService.user.create.mockResolvedValue(mockUser)

      const result = await service.create(data)

      expect(prismaService.user.create).toHaveBeenCalledWith({ data })
      expect(result).toEqual(mockUser)
    })
  })

  describe('update', () => {
    it('should update a user', async () => {
      const data = { name: 'Updated Name' }
      prismaService.user.update.mockResolvedValue({ ...mockUser, ...data })

      const result = await service.update('user-1', data)

      expect(prismaService.user.update).toHaveBeenCalledWith({ where: { id: 'user-1' }, data })
      expect(result).toEqual({ ...mockUser, ...data })
    })
  })

  describe('delete', () => {
    it('should delete a user', async () => {
      prismaService.user.delete.mockResolvedValue(mockUser)

      const result = await service.delete('user-1')

      expect(prismaService.user.delete).toHaveBeenCalledWith({ where: { id: 'user-1' } })
      expect(result).toEqual(mockUser)
    })
  })
})
