import type { State } from '../../pathfinding/graph/state';

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
  path: State[];
  totalCost: number;
  nodesExplored: number;
  success: boolean;
};
