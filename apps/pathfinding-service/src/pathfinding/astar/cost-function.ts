import { Coordinates } from 'src/common/types/coordinates';
import { heuristic } from './heuristic';
import { State } from '../graph/state';
import { edgeCostFunction } from './edge-cost';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import * as satellite from 'satellite.js';
import { NodeScores } from 'src/common/types/pathfinding.types';

/**
 * Calculates f(n) = g(n) + ε·h(n) for a given child node (Weighted A*).
 * Receives pre-computed satellite ECF positions to avoid redundant SGP4 work.
 * Returns gScore, fScore, and signalQuality for adaptive resolution.
 */
export function calculateNodeScores(
  childNodeState: State,
  goal: Coordinates,
  satelliteEcfPositions: satellite.EcfVec3<number>[],
  distanceKm: number,
): NodeScores {
  const hScore:number = heuristic(childNodeState, goal);

  const { cost: stepCost, signalQuality } = edgeCostFunction(childNodeState, satelliteEcfPositions, distanceKm);

  const gScore:number = childNodeState.costToPoint + stepCost;

  const fScore:number = gScore + PATHFINDING_DEFAULTS.HEURISTIC_WEIGHT * hScore;

  return {
    gScore,
    fScore,
    signalQuality,
  };
}
