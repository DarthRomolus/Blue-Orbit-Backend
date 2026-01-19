import { Controller, Get } from '@nestjs/common';
import { VisibilityService } from './visibility.service';

@Controller('visibility')
export class VisibilityController {
  constructor(private readonly visibilityService: VisibilityService) {}

  @Get('') //DEV
  getMaxSatelliteFootPrint() {
    const radius = this.visibilityService.calculateMaxFootprintRadius();
    const pos = this.visibilityService.calculateSatellitePosition({
      line1:
        '1 60391U 24140N   25363.45596712  .00000160  00000+0  22913-3 0  9994',
      line2:
        '2 60391  88.9770 297.6848 0013201 151.8526 208.3342 13.50983204 69528',
    });
    return { pos, radius };
  }
}
