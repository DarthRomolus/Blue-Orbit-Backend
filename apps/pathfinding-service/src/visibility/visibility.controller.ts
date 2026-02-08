import { Controller, Get, Param, Query } from '@nestjs/common';
import { VisibilityService } from './visibility.service';

@Controller('visibility')
export class VisibilityController {
  constructor(private readonly visibilityService: VisibilityService) {}

  //---------------------------------------------DEV------------------------------------
  @Get('test2')
  async runSanityTest2() {
    const startDate = new Date('2026-02-08T00:00:00.000Z');
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // עוד 4 שעות

    const telAvivCoords = { latitude: 32.0853, longitude: 34.7818 };
    const radiusKm = 100; // רדיוס גדול כדי בטוח לתפוס משהו
    const timeFrameHours = 11; // מחפשים את החלון הכי טוב של שעה אחת

    console.log('--- מפעיל בדיקה ידנית ---');
    console.log(
      `בודק בין ${startDate.toISOString()} לבין ${endDate.toISOString()}`,
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
