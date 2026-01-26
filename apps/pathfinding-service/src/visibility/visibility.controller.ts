import { Controller, Get, Param } from '@nestjs/common';
import { VisibilityService } from './visibility.service';

@Controller('visibility')
export class VisibilityController {
  constructor(private readonly visibilityService: VisibilityService) {}

  @Get('/:id')
  async getMaxSatelliteFootPrint(@Param('id') noradID: string) {
    const effectiveRadius = this.visibilityService.calculateEffectiveRadius();
    const pos =
      await this.visibilityService.calculateSatellitePosition(noradID);
    return { pos, effectiveRadius };
  }
}
