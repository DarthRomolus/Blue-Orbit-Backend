import { Controller, Get, Param } from '@nestjs/common';
import { VisibilityService } from './visibility.service';

@Controller('visibility')
export class VisibilityController {
  constructor(private readonly visibilityService: VisibilityService) {}

  @Get('/test') //dev
  public async test() {
    return await this.visibilityService.checkRMQ();
  }
}
