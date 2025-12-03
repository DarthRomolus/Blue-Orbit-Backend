import { Controller, Get, Param } from '@nestjs/common';
import { PositionService } from './position.service';

@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}
  @Get(':id')
  calculatePosition(@Param('id') noradId: string) {
    return this.positionService.calculatePosition(noradId);
  }
}
