import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard'
import { CloudnaryService } from 'src/common/services/cloudnary/cloudnary.service'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { CreateUserDTO, UpdateUserDTO, UserFullDTO, UserListItemDTO } from './user.dto'
import { UsersService } from './users.service'

@Controller({
  path: 'users',
  version: '1',
})
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudnaryService: CloudnaryService,
    private readonly requestContextService: RequestContextService,
  ) {}

  @Get()
  @ApiResponse({ type: [UserListItemDTO] })
  findAll() {
    return this.usersService.FindAll()
  }

  @Get(':userId')
  @ApiResponse({ type: UserFullDTO })
  findById(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.usersService.findById(userId)
  }

  @Get(':email')
  @ApiResponse({ type: UserFullDTO })
  findByEmail(@Param('email', ParseUUIDPipe) email: string) {
    return this.usersService.findById(email)
  }

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  create(@Body() user: CreateUserDTO) {
    this.usersService.create(user)
  }

  @Put(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  update(@Param('userId', ParseUUIDPipe) userId: string, @Body() data: UpdateUserDTO) {
    return this.usersService.update(userId, data)
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.usersService.delete(userId)
  }

  @Post('avatar')
  @ApiResponse({ status: HttpStatus.OK, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad request' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    const user = this.requestContextService.getUser()
    const userId = user.id;
    const response = await this.cloudnaryService.uploadImage(file, userId)
    const updatedUser = await this.usersService.update(userId, { ...user, avatar: response.url })
    return updatedUser
  }
}
