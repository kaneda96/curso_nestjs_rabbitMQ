import { ApiProperty } from '@nestjs/swagger'
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
