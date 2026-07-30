import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateCommentDTO {
  @ApiProperty({ description: 'Comment content' })
  @IsString()
  @IsNotEmpty()
  content: string
}

class CommentAuthorDTO {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() email: string
  @ApiProperty({ nullable: true }) avatar: string
}

export class CommentListItemDTO {
  @ApiProperty() id: string
  @ApiProperty() content: string
  @ApiProperty() taskId: string
  @ApiProperty() authorId: string
  @ApiProperty({ format: 'date-time' }) createdAt: string
  @ApiProperty({ format: 'date-time' }) updatedAT: string

  @ApiProperty({ type: CommentAuthorDTO })
  author: CommentAuthorDTO
}

class CommentTaskDTO {
  @ApiProperty() id: string
  @ApiProperty() title: string
  @ApiProperty() projectId: string
}

export class CommentFullDTO extends CommentListItemDTO {
  @ApiProperty({ type: CommentTaskDTO }) task: CommentTaskDTO
}

export class CreateCommentDTO extends UpdateCommentDTO {
  @ApiProperty()
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  authorId: string
}
