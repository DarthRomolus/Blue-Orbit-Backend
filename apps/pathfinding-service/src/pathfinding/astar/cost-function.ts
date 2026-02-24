import { Coordinates } from 'src/common/types/coordinates';
import { heuristic } from './heuristic';
import { State } from '../graph/state';
import { edgeCostFunction } from './edge-cost';
import * as satellite from 'satellite.js';

/**
calculates f cost of every node
*/
export function calculateNodeScores(
  childNodeState: State,
  goal: Coordinates,
  satellites: satellite.SatRec[],
) {
  const hScore = heuristic(childNodeState, goal);

  const stepCost = edgeCostFunction(childNodeState, satellites);

  const gScore = childNodeState.costToPoint + stepCost;

  const fScore = gScore + hScore;

  return {
    gScore,
    fScore,
  };
}
