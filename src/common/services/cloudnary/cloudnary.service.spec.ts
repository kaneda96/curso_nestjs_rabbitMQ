import { Test, TestingModule } from '@nestjs/testing'
import { Writable } from 'stream'
import { CloudinaryService } from './cloudnary.service'

jest.mock('cloudinary', () => ({
  v2: {
    uploader: {
      upload_stream: jest.fn(),
    },
    url: jest.fn(),
    config: jest.fn(),
  },
}))

describe('CloudinaryService', () => {
  let service: CloudinaryService
  const cloudinary: any = require('cloudinary').v2

  beforeEach(async () => {
    jest.clearAllMocks()

    const module: TestingModule = await Test.createTestingModule({
      providers: [CloudinaryService],
    }).compile()

    service = module.get<CloudinaryService>(CloudinaryService)
  })

  it('should be defined and configure cloudinary', () => {
    expect(service).toBeDefined()
    expect(cloudinary.config).toHaveBeenCalled()
  })

  it('upload should resolve with url on success', async () => {
    const fakeFile = { buffer: Buffer.from('test') } as Express.Multer.File

    cloudinary.url.mockReturnValue('http://example.com/avatar.jpg')

    ;(cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_opts, cb) => {
      const stream = new Writable({
        write(_chunk, _enc, callback) {
          callback()
        },
      })

      process.nextTick(() => cb(null, { public_id: 'test-public-id' }))

      return stream
    })

    const res = await service.uploadImage(fakeFile, 'test-name')

    expect(res).toEqual({ url: 'http://example.com/avatar.jpg' })

    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      expect.objectContaining({ public_id: 'test-name', folder: 'avatar' }),
      expect.any(Function),
    )

    expect(cloudinary.url).toHaveBeenCalledWith(
      'test-public-id',
      expect.objectContaining({ fetch_format: 'auto', quality: 'auto' }),
    )
  })

  it('should be defined and configure cloudinary', () => {
    expect(service).toBeDefined()
    expect(cloudinary.config).toHaveBeenCalled()
  })

  it('upload should resolve with url on success', async () => {
    const fakeFile = { buffer: Buffer.from('test') } as Express.Multer.File

    cloudinary.url.mockReturnValue('http://example.com/avatar.jpg')

    ;(cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_opts, cb) => {
      const stream = new Writable({
        write(_chunk, _enc, callback) {
          callback()
        },
      })

      process.nextTick(() => cb(null, { public_id: 'test-public-id' }))

      return stream
    })

    const res = await service.uploadImage(fakeFile, 'test-name')

    expect(res).toEqual({ url: 'http://example.com/avatar.jpg' })

    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      expect.objectContaining({ public_id: 'test-name', folder: 'avatar' }),
      expect.any(Function),
    )

    expect(cloudinary.url).toHaveBeenCalledWith(
      'test-public-id',
      expect.objectContaining({ fetch_format: 'auto', quality: 'auto' }),
    )
  })

  it('upload should reject when cloudinary returns error', async () => {
    const fakeFile = { buffer: Buffer.from('test') } as Express.Multer.File

    ;(cloudinary.uploader.upload_stream as jest.Mock).mockImplementation((_opts, cb) => {
      const stream = new Writable({
        write(_chunk, _enc, callback) {
          callback()
        },
      })

      process.nextTick(() => cb(new Error('upload failed'), null))

      return stream
    })

    await expect(service.uploadImage(fakeFile, 'test-name')).rejects.toThrow('upload failed')
  })
})
