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
import { ProjectListItemDTO, ProjectRequestDTO } from './project.dto'
import { ProjectsService } from './projects.service'

@Controller({ path: 'projects', version: '1' })
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiResponse({
    type: [ProjectListItemDTO],
  })
  findAll() {
    return this.projectsService.findAll()
  }

  @Get(':id')
  @ApiResponse({
    type: ProjectListItemDTO,
  })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    const project = await this.projectsService.findById(id)
    if (project === null) {
      throw {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Project not found',
      }
    }
    return project
  }

  @Post()
  @ApiResponse({
    type: ProjectListItemDTO,
  })
  create(@Body() project: ProjectRequestDTO) {
    return this.projectsService.create(project)
  }

  @Put(':id')
  @ApiResponse({
    type: ProjectListItemDTO,
  })
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() data: ProjectRequestDTO) {
    const project = await this.projectsService.findById(id)
    if (project === null) {
      throw {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Project not found',
      }
    }
    return this.projectsService.update(id, data)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id', ParseUUIDPipe) id: string) {
    return this.projectsService.delete(id)
  }
}
