import type { State } from '../../pathfinding/graph/state';
import { SatellitePositionGeodetic } from './satellite';

export type EdgeCostResult = {
  cost: number;
  signalQuality: number;
};

export type NodeScores = {
  gScore: number;
  fScore: number;
  signalQuality: number;
};

export type AstarResult = {
  path: SatellitePositionGeodetic[];
  totalCost: number;
  nodesExplored: number;
  success: boolean;
};
