import { Module } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CollaboratorsController } from './collaborators.controller'
import { CollaboratorsService } from './collaborators.service'

@Module({
  providers: [CollaboratorsService, PrismaService],
  controllers: [CollaboratorsController],
})
export class CollaboratorsModule {}
