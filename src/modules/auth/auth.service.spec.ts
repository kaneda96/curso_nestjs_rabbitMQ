import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import * as bcrypt from 'bcrypt'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { MailService } from '../mail/mail.service'
import { UsersService } from '../users/users.service'
import { AuthService } from './auth.service'

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}))

describe('AuthService', () => {
  let service: AuthService
  let jwtService: jest.Mocked<JwtService>
  let prismaService: {
    user: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock }
  }
  let userService: { findByEmail: jest.Mock; findById: jest.Mock }
  let requestContextService: { setUser: jest.Mock; getUserId: jest.Mock }
  let mailService: { sendPasswordResetEmail: jest.Mock }

  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashed-password',
    avatar: null,
    role: 'ADMIN',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(async () => {
    jest.clearAllMocks()
    ;(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password')
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)

    jwtService = { sign: jest.fn().mockReturnValue('jwt-token'), verify: jest.fn() } as any
    prismaService = {
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    }
    userService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    }
    requestContextService = {
      setUser: jest.fn(),
      getUserId: jest.fn(),
    }
    mailService = {
      sendPasswordResetEmail: jest.fn(),
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: jwtService },
        { provide: PrismaService, useValue: prismaService },
        { provide: UsersService, useValue: userService },
        { provide: RequestContextService, useValue: requestContextService },
        { provide: MailService, useValue: mailService },
      ],
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('signUp', () => {
    it('should hash the password and create a new user', async () => {
      const data = { name: 'John Doe', email: 'john@example.com', password: 'password123' }
      prismaService.user.create.mockResolvedValue(mockUser)

      const result = await service.signUp(data)

      expect(bcrypt.hash).toHaveBeenCalledWith(data.password, 12)
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { ...data, password: 'hashed-password' },
      })
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: mockUser.id })
      expect(result).toBe('jwt-token')
    })
  })

  describe('signIn', () => {
    it('should return a token when credentials are valid', async () => {
      userService.findByEmail.mockResolvedValue(mockUser)

      const result = await service.signIn({ email: mockUser.email, password: 'password123' })

      expect(userService.findByEmail).toHaveBeenCalledWith(mockUser.email)
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password)
      expect(requestContextService.setUser).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual({ token: 'jwt-token' })
    })

    it('should throw UnauthorizedException when user is not found', async () => {
      userService.findByEmail.mockResolvedValue(null)

      await expect(
        service.signIn({ email: 'missing@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException)
    })

    it('should throw UnauthorizedException when password does not match', async () => {
      userService.findByEmail.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(
        service.signIn({ email: mockUser.email, password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException)
    })
  })

  describe('forgotPassword', () => {
    it('should throw UnauthorizedException when user is not found', async () => {
      userService.findByEmail.mockResolvedValue(null)

      await expect(service.forgotPassword('missing@example.com')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should send a password reset email with a valid token', async () => {
      userService.findByEmail.mockResolvedValue(mockUser)

      const result = await service.forgotPassword(mockUser.email)

      expect(jwtService.sign).toHaveBeenCalledWith(
        { sub: mockUser.id, email: mockUser.email, purpose: 'reset-password' },
        { expiresIn: '1h' },
      )
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalledWith(mockUser.email, 'jwt-token')
      expect(result).toEqual({ message: 'Password reset email sent' })
    })
  })

  describe('changePassword', () => {
    const data = { currentPassword: 'old-password', newPassword: 'new-password' }

    it('should throw NotFoundException when user is not found', async () => {
      prismaService.user.findUnique.mockResolvedValue(null)

      await expect(service.changePassword('user-1', data)).rejects.toThrow(NotFoundException)
    })

    it('should throw UnauthorizedException when current password is invalid', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser)
      ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

      await expect(service.changePassword('user-1', data)).rejects.toThrow(UnauthorizedException)
    })

    it('should hash the new password and update the user', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser)
      prismaService.user.update.mockResolvedValue({ ...mockUser, password: 'hashed-password' })

      const result = await service.changePassword('user-1', data)

      expect(bcrypt.compare).toHaveBeenCalledWith('old-password', mockUser.password)
      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 12)
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { password: 'hashed-password' },
      })
      expect(result).toEqual({ ...mockUser, password: 'hashed-password' })
    })
  })

  describe('resetPassword', () => {
    const token = 'reset-token'
    const validPayload = {
      sub: 'user-1',
      email: 'john@example.com',
      purpose: 'reset-password',
    }

    it('should reset the password with a valid token', async () => {
      jwtService.verify.mockReturnValue(validPayload as any)
      userService.findById.mockResolvedValue(mockUser)
      prismaService.user.update.mockResolvedValue(mockUser)

      const result = await service.resetPassword(token, 'new-password')

      expect(jwtService.verify).toHaveBeenCalledWith(token, { secret: process.env.JWT_SECRET })
      expect(userService.findById).toHaveBeenCalledWith('user-1')
      expect(bcrypt.hash).toHaveBeenCalledWith('new-password', 12)
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { password: 'hashed-password' },
      })
      expect(result).toEqual({ message: 'Password reset successful' })
    })

    it('should throw UnauthorizedException when token is invalid or expired', async () => {
      jwtService.verify.mockImplementation(() => {
        throw new Error('jwt expired')
      })

      await expect(service.resetPassword(token, 'new-password')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw UnauthorizedException when token purpose is not reset-password', async () => {
      jwtService.verify.mockReturnValue({ sub: 'user-1', purpose: 'other' } as any)

      await expect(service.resetPassword(token, 'new-password')).rejects.toThrow(
        UnauthorizedException,
      )
    })

    it('should throw UnauthorizedException when user is not found', async () => {
      jwtService.verify.mockReturnValue(validPayload as any)
      userService.findById.mockResolvedValue(null)

      await expect(service.resetPassword(token, 'new-password')).rejects.toThrow(
        UnauthorizedException,
      )
    })
  })
})
