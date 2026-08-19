import { Module } from '@nestjs/common'
import { CloudinaryService } from 'src/common/services/cloudnary/cloudnary.service'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { PrismaService } from 'src/prisma.service'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'

@Module({
  providers: [UsersService, PrismaService, RequestContextService, CloudinaryService, UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
