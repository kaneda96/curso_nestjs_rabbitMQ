import { Controller, Get } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'
import { AppService } from './app.service'

@Controller({
  version: '1',
})
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiResponse({
    status: 200,
    description: 'Health check passed!',
    schema: {
      example: {
        message: 'Health check passed!',
      },
    },
  })
  health(): { message: string } {
    return this.appService.health()
  }
}
