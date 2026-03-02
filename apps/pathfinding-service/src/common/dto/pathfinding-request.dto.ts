import { Coordinates } from '../types/coordinates';

export class StartStateDto {
  latitude: number;
  longitude: number;
  altitude: number;
  bearingDegrees: number;
  time: string;
}

export class PathfindingRequestDto {
  startState: StartStateDto;
  goal: Coordinates;
}
