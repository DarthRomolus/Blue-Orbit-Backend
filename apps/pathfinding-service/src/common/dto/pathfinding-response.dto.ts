import { SatellitePositionGeodetic } from '../types/satellite';
import { SignalQualityPoint } from '../types/pathfinding.types';

export class PathfindingResponseDto {
  path: SatellitePositionGeodetic[];
  signalQualityTimeline: SignalQualityPoint[];
  success: boolean;
  nodesExplored: number;
  totalCost: number;
  pathLength: number;
}
