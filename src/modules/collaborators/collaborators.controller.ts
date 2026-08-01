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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiCreatedResponse, ApiOkResponse, ApiResponse } from '@nestjs/swagger'
import { ValidateResourcesId } from 'src/common/decorators/validate-resources-id/validate-resources-id.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth/jwt-auth.guard'
import { ValidateResourcesIdInterceptor } from 'src/interceptors/validate-resources-id/validate-resources-id.interceptor'
import {
  AddCollaboratorDTO,
  CollaboratorListItemDTO,
  UpdateCollaboratorDTO,
} from './collaborators.dto'
import { CollaboratorsService } from './collaborators.service'

@Controller({
  path: 'projects/:projectId/collaborators',
  version: '1',
})

@UseInterceptors(ValidateResourcesIdInterceptor)
@UseGuards(JwtAuthGuard)
export class CollaboratorsController {
  constructor(private collaboratorsService: CollaboratorsService) {}

  @Get()
  @ValidateResourcesId()
  @ApiResponse({ type: [CollaboratorListItemDTO] })
  findAllByProject(@Param('projectId', ParseUUIDPipe) projectId: string) {
    return this.collaboratorsService.findAllByProject(projectId)
  }

  @Post()
  @ValidateResourcesId()
  @ApiCreatedResponse({
    type: CollaboratorListItemDTO,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Param('projectId', ParseUUIDPipe) projectId: string, @Body() data: AddCollaboratorDTO) {
    return this.collaboratorsService.create(projectId, data)
  }

  @Put(':userId')
  @ValidateResourcesId()
  @ApiOkResponse({
    type: CollaboratorListItemDTO,
  })
  update(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() data: UpdateCollaboratorDTO,
  ) {
    return this.collaboratorsService.update(projectId, userId, data)
  }

  @Delete(':userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ValidateResourcesId()
  delete(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
  ) {
    return this.collaboratorsService.delete(projectId, userId)
  }
}
