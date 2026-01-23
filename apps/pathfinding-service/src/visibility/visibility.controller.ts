import { Controller, Get } from '@nestjs/common';
import { VisibilityService } from './visibility.service';

@Controller('visibility')
export class VisibilityController {
  constructor(private readonly visibilityService: VisibilityService) {}

  @Get('/:id') //DEV
  getMaxSatelliteFootPrint() {
    const effectiveRadius = this.visibilityService.calculateEffectiveRadius();
    const pos = this.visibilityService.calculateSatellitePosition({
      line1:
        '1 48787U 21045W   26019.76421818 -.00000067  00000+0 -21080-3 0  9999',
      line2:
        '2 48787  87.9013 288.8028 0001549  51.0254 309.1015 13.15549748224808',
    });
    return { pos, effectiveRadius };
  }
}
