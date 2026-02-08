import { Controller, Get, Param, Query } from '@nestjs/common';
import { VisibilityService } from './visibility.service';

@Controller('visibility')
export class VisibilityController {
  constructor(private readonly visibilityService: VisibilityService) {}

  @Get('test2')
  async runSanityTest2() {
    const startDate = new Date('2026-02-08T16:50:02.200Z');
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    const telAvivCoords = { latitude: 32.0853, longitude: 34.7818 };
    const radiusKm = 100;
    const timeFrameHours = 1;

    console.log(
      `check between ${startDate.toISOString()} and ${endDate.toISOString()}`,
    );

    const result =
      await this.visibilityService.calculateMaxCoverageTimeWindowOptimized(
        startDate,
        endDate,
        telAvivCoords,
        radiusKm,
        timeFrameHours,
      );

    // 3. החזרת התשובה ישר לדפדפן
    return {
      message: 'Test Complete',
      inputs: { startDate, endDate, radiusKm },
      result: result,
    };
  }
  //---------------------------------------------DEV------------------------------------
}
