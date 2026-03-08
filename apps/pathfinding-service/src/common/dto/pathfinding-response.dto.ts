import { SatellitePositionGeodetic } from '../types/satellite';

export class PathfindingResponseDto {
  path: SatellitePositionGeodetic[];
  success: boolean;
  nodesExplored: number;
  totalCost: number;
  pathLength: number;
}
