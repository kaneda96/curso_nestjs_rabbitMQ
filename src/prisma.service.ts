import { Injectable } from '@nestjs/common'
import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma-generated/client'

const connectionString = `${process.env.DATABASE_URL}`

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({ connectionString }, { schema: 'myPostgresSchema' })
    super({ adapter })
  }
}
