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
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger'
import { ValidateResourcesId } from 'src/common/decorators/validate-resources-id/validate-resources-id.decorator'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'
import { RequestContextService } from 'src/common/services/request-context/request-context.service'
import { ApiPaginatedResponse } from 'src/common/swagger/api-paginated-response'
import { ValidateResourcesIdInterceptor } from 'src/interceptors/validate-resources-id/validate-resources-id.interceptor'
import { TaskFullDTO, TaskListItemDTO, TaskRequestDTO } from './task.dto'
import { TasksService } from './tasks.service'

@Controller({
  path: 'projects/:projectId/tasks',
  version: '1',
})
@UseInterceptors(ValidateResourcesIdInterceptor)
@ApiBearerAuth('jwt')
export class TasksController {
  constructor(
    private readonly tasksService: TasksService,
    private readonly requestContextService: RequestContextService,
  ) {}

  @Get()
  @ValidateResourcesId()
  @ApiPaginatedResponse(TaskListItemDTO)
  findAllByProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query() query?: QueryPaginationDTO,
  ) {
    return this.tasksService.findMany(projectId, query)
  }

  @Get(':taskId')
  @ValidateResourcesId()
  @ApiOkResponse({ type: TaskFullDTO })
  findById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.tasksService.findById(taskId, projectId)
  }

  @Post()
  @ValidateResourcesId()
  @ApiCreatedResponse({ type: TaskListItemDTO })
  @HttpCode(HttpStatus.CREATED)
  create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() task: TaskRequestDTO) {
    return this.tasksService.create(projectId, task)
  }

  @Put(':taskId')
  @ApiOkResponse({ type: TaskListItemDTO })
  @HttpCode(HttpStatus.OK)
  @ValidateResourcesId()
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() task: TaskRequestDTO,
  ) {
    return this.tasksService.update(projectId, taskId, task)
  }

  @Delete(':taskId')
  @ApiNoContentResponse({ description: 'Task deleted!' })
  @ValidateResourcesId()
  async delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    await this.tasksService.delete(projectId, taskId)
  }
}
