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
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger'
import { ValidateResourcesId } from 'src/common/decorators/validate-resources-id/validate-resources-id.decorator'
import { QueryPaginationDTO } from 'src/common/dtos/query-pagination.dto'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard'
import { ApiPaginatedResponse } from 'src/common/swagger/api-paginated-response'
import { ValidateResourcesIdInterceptor } from 'src/interceptors/validate-resources-id/validate-resources-id.interceptor'
import { ProjectFullDTO, ProjectListItemDTO, RequestProjectDTO } from './project.dto'
import { ProjectsService } from './projects.service'

@Controller({ path: 'projects', version: '1' })
@UseInterceptors(ValidateResourcesIdInterceptor)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('jwt')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiPaginatedResponse(ProjectListItemDTO)
  async findAll(@Query() query?: QueryPaginationDTO) {
    return this.projectsService.findAll(query)
  }

  @Get(':projectId')
  @ApiResponse({
    type: ProjectFullDTO,
  })
  @ValidateResourcesId()
  async findById(@Param('projectId', ParseUUIDPipe) id: string) {
    return await this.projectsService.findById(id)
  }

  @Post()
  @ApiResponse({
    type: ProjectListItemDTO,
  })
  create(@Body() project: RequestProjectDTO) {
    return this.projectsService.create(project)
  }

  @Put(':projectId')
  @ApiResponse({
    type: ProjectListItemDTO,
  })
  @ValidateResourcesId()
  async update(@Param('projectId', ParseUUIDPipe) id: string, @Body() data: RequestProjectDTO) {
    return this.projectsService.update(id, data)
  }

  @Delete(':projectId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ValidateResourcesId()
  delete(@Param('projectId', ParseUUIDPipe) id: string) {
    return this.projectsService.delete(id)
  }
}
