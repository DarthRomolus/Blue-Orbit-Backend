import { Controller, Get } from '@nestjs/common';
import { nodesBuilder } from './graph/nodes-builder';
import { pathToGeoJSON } from 'src/common/utils/geo-calculations.utils';
import { astarEngine } from './astar/astar-engine';
import { PathfindingService } from './pathfinding.service';

@Controller('pathfinding')
export class PathfindingController {
  constructor(private readonly pathfindingService: PathfindingService) {}
  //------------------------------------DEV---------------------------
  @Get('nodes')
  getChildNodes() {
    const testState = {
      parentNode: null,
      latitude: 0,
      longitude: 0,
      altitude: 10000,
      bearingDegrees: 0,
      time: new Date('2026-02-24T12:00:00.000Z'), // שעה עגולה
      costToPoint: 5,
    };
    return nodesBuilder(testState, 1000);
  }
  //------------------------------------DEV---------------------------
  // ... שאר הייבואים (State, Coordinates וכו')

  @Get('test-route')
  async testRoute() {
    // 1. הגדרת נקודת ההתחלה (תל אביב)
    const startState = {
      latitude: 32.0853,
      longitude: 34.7818,
      altitude: 10000,
      bearingDegrees: 115,
      time: new Date('2026-02-25T12:00:00.000Z'),
      costToPoint: 0,
      parentNode: null,
    };

    // 2. הגדרת היעד (חיפה)
    const goal = {
      latitude: 32.794,
      longitude: 34.9896,
    };
    const goal2 = {
      latitude: 40.7,
      longitude: -74,
    };
    const goal3 = {
      latitude: -33,
      longitude: 151,
    };
    // נניח שכרגע מערך הלוויינים ריק לבדיקה בסיסית של קינמטיקה
    const satellites = [];

    // 3. הרצת המנוע
    const result = await this.pathfindingService.calculateOptimalPath(
      startState,
      goal3,
    );

    // 4. החזרת התשובה כולל ה-GeoJSON
    return {
      success: result.success,
      nodesExplored: result.nodesExplored,
      totalCost: result.totalCost,
      pathLength: result.path.length,
      // הנה הקסם הוויזואלי:
      geoJson: pathToGeoJSON(result.path),
    };
  }
}
