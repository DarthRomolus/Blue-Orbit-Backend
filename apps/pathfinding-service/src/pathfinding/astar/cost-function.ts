import { Coordinates } from 'src/common/types/coordinates';
import { heuristic } from './heuristic';
import { State } from '../graph/state';
import { edgeCostFunction } from './edge-cost';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import * as satellite from 'satellite.js';

/**
 * Calculates f(n) = g(n) + ε·h(n) for a given child node (Weighted A*).
 * Receives pre-computed satellite ECF positions to avoid redundant SGP4 work.
 */
export function calculateNodeScores(
  childNodeState: State,
  goal: Coordinates,
  satelliteEcfPositions: satellite.EcfVec3<number>[],
  distanceKm: number,
) {
  const hScore = heuristic(childNodeState, goal);

  const stepCost = edgeCostFunction(childNodeState, satelliteEcfPositions, distanceKm);

  const gScore = childNodeState.costToPoint + stepCost;

  const fScore = gScore + PATHFINDING_DEFAULTS.HEURISTIC_WEIGHT * hScore;

  return {
    gScore,
    fScore,
  };
}
