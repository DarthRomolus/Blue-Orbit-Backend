import { Controller, Get, Param, Query } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { TimeWindowScore } from 'src/common/types/timeWindowScore';

@Controller('visibility')
export class VisibilityController {
  constructor(private readonly visibilityService: VisibilityService) {}
  //---------------------------------------------DEV------------------------------------
  @Get('test')
  async runSanityTest() {
    // 1. הגדרת משתנים (Hardcoded) לבדיקה
    const startDate = new Date(); // עכשיו
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // עוד 4 שעות

    const telAvivCoords = { latitude: 32.0853, longitude: 34.7818 };
    const radiusKm = 500; // רדיוס גדול כדי בטוח לתפוס משהו
    const timeFrameHours = 1; // מחפשים את החלון הכי טוב של שעה אחת

    console.log('--- מפעיל בדיקה ידנית ---');
    console.log(
      `בודק בין ${startDate.toISOString()} לבין ${endDate.toISOString()}`,
    );

    // 2. הפעלת הסרביס
    const result = await this.visibilityService.calculateMaxCoverageTimeWindow(
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
