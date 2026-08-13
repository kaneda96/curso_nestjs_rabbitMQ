import { ApiProperty } from '@nestjs/swagger'
import { TaskPriority, TaskStatus } from '@prisma/client'
import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class TaskRequestDTO {
  @ApiProperty({
    description: 'task title',
  })
  @IsNotEmpty()
  title: string

  @ApiProperty({
    description: 'task description',
  })
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: 'task status',
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus = TaskStatus.TODO

  @ApiProperty({
    description: 'task priority',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority = TaskPriority.MEDIUM

  @ApiProperty({
    description: 'task due date',
    format: 'date-time',
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string

  @ApiProperty({
    description: 'assigne User Id',
    required: false,
  })
  @IsString()
  @IsOptional()
  assigneeId: string
}

export class TaskBaseDTO {
  @ApiProperty() id: string
  @ApiProperty() title: string
  @ApiProperty({ nullable: true, required: false }) description?: string | null
  @ApiProperty({ enum: TaskStatus }) status: TaskStatus
  @ApiProperty({ enum: TaskPriority }) priority: TaskPriority
  @ApiProperty({ nullable: true, required: false, format: 'date-time' }) dueDate: Date | null
  @ApiProperty({ format: 'date-time' }) createdAt: Date
  @ApiProperty({ format: 'date-time' }) updatedAt: Date
}

export class TaskAssigneeDTO {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() email: string
  @ApiProperty({ nullable: true, required: false }) avatar?: string | null
}

export class TaskListItemDTO extends TaskBaseDTO {
  @ApiProperty({ type: TaskAssigneeDTO, nullable: true, required: false })
  assignee?: TaskAssigneeDTO | null
}

export class TaskCommentUserDTO {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() emai: string
  @ApiProperty({ nullable: true, required: false }) avatar?: string | null
}

export class TaskCommentDTO {
  @ApiProperty() id: string
  @ApiProperty() content: string
  @ApiProperty({ format: 'date-time' }) createdAt: Date
  @ApiProperty({ type: TaskCommentUserDTO }) user: TaskCommentUserDTO
}

export class TaskFullDTO extends TaskBaseDTO {
  @ApiProperty({ type: TaskAssigneeDTO, nullable: true, required: false })
  assignee?: TaskAssigneeDTO | null

  @ApiProperty({ type: [TaskCommentDTO] })
  comments: TaskCommentDTO[]
}
