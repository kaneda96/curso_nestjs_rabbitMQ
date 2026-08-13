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
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiResponse } from '@nestjs/swagger'
import { ValidateResourcesId } from 'src/common/decorators/validate-resources-id/validate-resources-id.decorator'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard'
import { ApiPaginatedResponse } from 'src/common/swagger/api-paginated-response'
import { ValidateResourcesIdInterceptor } from 'src/interceptors/validate-resources-id/validate-resources-id.interceptor'
import { CommentFullDTO, CommentListItemDTO, CommentRequestDTO } from './comments.dto'
import { CommentsService } from './comments.service'

@Controller({
  path: 'projects/:projectId/tasks/:taskId/comments',
  version: '1',
})
@UseGuards(JwtAuthGuard)
@UseInterceptors(ValidateResourcesIdInterceptor)
@ApiBearerAuth('jwt')
export class CommentsController {
  constructor(private readonly service: CommentsService) {}

  @Get()
  @ApiPaginatedResponse(CommentListItemDTO)
  @ValidateResourcesId()
  async findAllByTask(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query() query?: QueryPaginationDTO,
  ) {
    return await this.service.findAllByTask(taskId, query)
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
  create(@Param('taskId', ParseUUIDPipe) taskId: string, @Body() data: CommentRequestDTO) {
    this.service.create(taskId, data)
  }

  @Put(':commentId')
  @ValidateResourcesId()
  @ApiResponse({ type: CommentListItemDTO })
  update(
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Param('commentId', ParseUUIDPipe) commentId: string,
    @Body() data: CommentRequestDTO,
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
