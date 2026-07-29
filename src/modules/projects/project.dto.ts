import { ApiProperty } from '@nestjs/swagger'
import { TaskPriority, TaskStatus } from '@prisma/client'
import { IsNotEmpty, IsString } from 'class-validator'

export class ProjectRequestDTO {
  //id: string
  @ApiProperty({ example: 'Project Name' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 'Project Description', required: false })
  @IsString()
  description: string
  //createdAt: Date
  //updatedAt: Date
}

export class ProjectListItemDTO {
  @ApiProperty({ example: 'Project ID' }) id: string
  @ApiProperty({ example: 'Project Name' }) name: string
  @ApiProperty({ example: 'Project Description' }) description: string
  @ApiProperty({ format: 'date-time' }) createdAt: string
  @ApiProperty({ format: 'date-time' }) updatedAt: string
}

export class ProjectTaskDTO {
  @ApiProperty({ example: 'task name' }) id: string
  @ApiProperty({ example: 'task description' }) title: string
  @ApiProperty({ nullable: true, required: false }) desciption?: string
  @ApiProperty({ enum: TaskStatus }) status: string
  @ApiProperty({ enum: TaskPriority }) priority: string
  @ApiProperty({ format: 'date-time', required: false }) dueDate?: string
  @ApiProperty({ format: 'date-time' }) createdAt: string
  @ApiProperty({ format: 'date-time' }) updatedAt: string
}

export class ProjectFullDTO extends ProjectListItemDTO {
  @ApiProperty({ type: [ProjectTaskDTO] }) tasks: ProjectTaskDTO[]
}
