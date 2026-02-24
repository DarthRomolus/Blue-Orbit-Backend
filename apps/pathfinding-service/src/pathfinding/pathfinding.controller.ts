import { Controller, Get } from '@nestjs/common';
import { nodesBuilder } from './graph/nodes-builder';

@Controller('pathfinding')
export class PathfindingController {
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
    return nodesBuilder(testState);
  }
  //------------------------------------DEV---------------------------
}
