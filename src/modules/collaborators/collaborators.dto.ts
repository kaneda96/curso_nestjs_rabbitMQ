import { ApiProperty } from '@nestjs/swagger'
import { ColaborattorRole } from '@prisma-generated/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class AddCollaboratorDTO {
  @ApiProperty({ description: 'User ID to add as colaborator' })
  @IsString()
  @IsNotEmpty()
  userId: string

  @ApiProperty({
    description: 'Collaborattor Role',
    enum: ColaborattorRole,
    default: ColaborattorRole.EDITOR,
    required: false,
  })
  @IsOptional()
  @IsEnum(ColaborattorRole)
  role?: ColaborattorRole = ColaborattorRole.EDITOR
}

export class UpdateCollaboratorDTO {
  @ApiProperty({
    description: 'Collaborattor Role',
    enum: ColaborattorRole,
  })
  @IsNotEmpty()
  @IsEnum(ColaborattorRole)
  role?: ColaborattorRole = ColaborattorRole.EDITOR
}

export class CollabotarorUserDTO {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() email: string
  @ApiProperty() avatar: string | null
}

export class CollaboratorListItemDTO {
  @ApiProperty() id: string
  @ApiProperty() projectId: string
  @ApiProperty() userId: string
  @ApiProperty() role: ColaborattorRole
  @ApiProperty({ format: 'date-time' }) createdAt: Date
  @ApiProperty() user: CollabotarorUserDTO
}
