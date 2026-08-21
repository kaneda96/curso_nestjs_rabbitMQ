import { Test, TestingModule } from '@nestjs/testing'
import { CloudinaryService } from 'src/common/services/cloudnary/cloudnary.service'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

jest.mock('cloudinary', () => ({
  v2: {
    uploader: { upload_stream: jest.fn() },
    url: jest.fn(),
    config: jest.fn(),
  },
}))

describe('UsersController', () => {
  let controller: UsersController
  let usersService: {
    FindAll: jest.Mock
    findById: jest.Mock
    create: jest.Mock
    update: jest.Mock
    delete: jest.Mock
  }
  let cloudinaryService: { uploadImage: jest.Mock }
  let requestContextService: { getUser: jest.Mock }

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: null,
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    usersService = {
      FindAll: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    }
    cloudinaryService = {
      uploadImage: jest.fn(),
    }
    requestContextService = {
      getUser: jest.fn().mockReturnValue(mockUser),
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: usersService },
        { provide: CloudinaryService, useValue: cloudinaryService },
        { provide: RequestContextService, useValue: requestContextService },
      ],
    }).compile()

    controller = module.get<UsersController>(UsersController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('should return all users', () => {
    const result = { data: [], meta: {} }
    usersService.FindAll.mockReturnValue(result)

    expect(controller.findAll()).toEqual(result)
    expect(usersService.FindAll).toHaveBeenCalled()
  })

  it('should return a user by id', () => {
    usersService.findById.mockReturnValue(mockUser)

    expect(controller.findById('user-1')).toEqual(mockUser)
    expect(usersService.findById).toHaveBeenCalledWith('user-1')
  })

  it('should find a user by email', () => {
    usersService.findById.mockReturnValue(mockUser)

    expect(controller.findByEmail('john@example.com')).toEqual(mockUser)
    expect(usersService.findById).toHaveBeenCalledWith('john@example.com')
  })

  it('should create a user', () => {
    const data = { name: 'John Doe', email: 'john@example.com', password: 'password123' }
    usersService.create.mockReturnValue(mockUser)

    controller.create(data)

    expect(usersService.create).toHaveBeenCalledWith(data)
  })

  it('should update a user', () => {
    const data = { name: 'Updated Name' }
    usersService.update.mockReturnValue({ ...mockUser, ...data })

    expect(controller.update('user-1', data)).toEqual({ ...mockUser, ...data })
    expect(usersService.update).toHaveBeenCalledWith('user-1', data)
  })

  it('should delete a user', () => {
    usersService.delete.mockReturnValue(mockUser)

    expect(controller.delete('user-1')).toEqual(mockUser)
    expect(usersService.delete).toHaveBeenCalledWith('user-1')
  })

  it('should upload an avatar and update the user', async () => {
    const file = { buffer: Buffer.from('test') } as Express.Multer.File
    cloudinaryService.uploadImage.mockResolvedValue({ url: 'http://example.com/avatar.jpg' })
    usersService.update.mockResolvedValue({ ...mockUser, avatar: 'http://example.com/avatar.jpg' })

    const result = await controller.uploadAvatar(file)

    expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(file, 'user-1')
    expect(usersService.update).toHaveBeenCalledWith('user-1', {
      ...mockUser,
      avatar: 'http://example.com/avatar.jpg',
    })
    expect(result).toEqual({ ...mockUser, avatar: 'http://example.com/avatar.jpg' })
  })
})
