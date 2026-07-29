import { ApiProperty } from '@nestjs/swagger'
import { TaskPriority, TaskStatus } from '@prisma/client'
import { IsDate, IsDateString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'

export class TaskDTO {
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
  })
  @IsDateString()
  @IsOptional()
  dueDate?: string
}
