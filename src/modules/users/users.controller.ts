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
} from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { CreateUserDTO, UpdateUserDTO, UserFullDTO, UserListItemDTO } from './user.dto'
import { UsersService } from './users.service'

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
