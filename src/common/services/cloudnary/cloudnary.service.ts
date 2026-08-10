import { Readable } from 'node:stream'
import { Injectable } from '@nestjs/common'
import { v2 as cloudinary } from 'cloudinary'

@Injectable()
export class CloudnaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })
  }

  async uploadImage(file: Express.Multer.File, name: string): Promise<{ url: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: name,
          folder: 'avatar',
        },
        (error, result) => {
          if (error || !result) {
            reject(error)
          } else {
            const url = cloudinary.url(result.public_id, {
              fetch_format: 'auto',
              quality: 'auto',
            })
            resolve({ url })
          }
        },
      )

      const readableStream = new Readable()
      readableStream.push(file.buffer)
      readableStream.push(null)
      readableStream.pipe(uploadStream)
    })
  }
}
