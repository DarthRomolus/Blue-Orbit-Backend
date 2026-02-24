import { Coordinates } from 'src/common/types/coordinates';
import { heuristic } from './heuristic';
import { State } from '../graph/state';
import { edgeCostFunction } from './edge-cost';
import * as satellite from 'satellite.js';

/**
calculates f cost of every node
*/
export function calculateNodeScores(
  ChildNodeState: State,
  goal: Coordinates,
  satellites: satellite.SatRec[],
) {
  const hScore = heuristic(ChildNodeState, goal);

  const stepCost = edgeCostFunction(ChildNodeState, satellites);

  const gScore = ChildNodeState.costToPoint + stepCost;

  const fScore = gScore + hScore;

  return {
    gScore,
    fScore,
  };
}
