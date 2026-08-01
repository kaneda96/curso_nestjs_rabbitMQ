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
import { ValidateResourcesId } from 'src/common/decorators/validate-resources-id/validate-resources-id.decorator'
import { ValidateResourcesIdInterceptor } from 'src/interceptors/validate-resources-id/validate-resources-id.interceptor'
import { TaskDTO } from './task.dto'
import { TasksService } from './tasks.service'

@Controller({
  path: 'projects/:projectId/tasks',
  version: '1',
})
@UseInterceptors(ValidateResourcesIdInterceptor)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ValidateResourcesId()
  findAllByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.tasksService.findMany(projectId)
  }

  @Get(':taskId')
  findProjectById(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    return this.tasksService.findById(taskId, projectId)
  }

  @Post()
  @ValidateResourcesId()
  create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() task: TaskDTO) {
    return this.tasksService.create(projectId, task)
  }

  @Put(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ValidateResourcesId()
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() task: TaskDTO,
  ) {
    return this.tasksService.update(projectId, taskId, task)
  }

  @Delete(':taskId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ValidateResourcesId()
  async delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
  ) {
    await this.tasksService.delete(projectId, taskId)
  }
}
