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
  UseInterceptors,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiOkResponse, ApiResponse } from '@nestjs/swagger'
import { ValidateResourcesId } from 'src/common/decorators/validate-resources-id.decorator'
import { ValidateResourcesIdInterceptor } from 'src/interceptors/validate-resources-id/validate-resources-id.interceptor'
import {
  CommentFullDTO,
  CommentListItemDTO,
  CreateCommentDTO,
  UpdateCommentDTO,
} from './comments.dto'
import { CommentsService } from './comments.service'

@Controller({
  path: 'projects/:projectId/tasks/:taskId/comments',
  version: '1',
})
@UseInterceptors(ValidateResourcesIdInterceptor)
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  @Get()
  @ApiResponse({ type: [CommentListItemDTO] })
  @ValidateResourcesId()
  async findAllByTask(@Param('taskId', ParseUUIDPipe) taskId: string) {
    return await this.service.findAllByTask(taskId)
  }

  @Get(':commentId')
  @ApiOkResponse({ type: CommentFullDTO })
  @ValidateResourcesId()
  findOne(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return this.service.findById(taskId, commentId)
  }

  @Post()
  @ValidateResourcesId()
  @ApiCreatedResponse({ type: CommentListItemDTO, description: 'Create new comment' })
  create(@Param('taskId', ParseUUIDPipe) taskId: string, @Body() data: CreateCommentDTO) {
    this.service.create(taskId, data)
  }

  @Put(':commentId')
  @ValidateResourcesId()
  @ApiResponse({ type: CommentListItemDTO })
  update(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() data: UpdateCommentDTO,
  ) {
    return this.service.update(taskId, commentId, data)
  }

  @Delete(':commentId')
  @ValidateResourcesId()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
  ) {
    return await this.service.remove(taskId, commentId)
  }
}
