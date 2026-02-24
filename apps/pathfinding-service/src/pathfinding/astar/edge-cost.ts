import * as satellite from 'satellite.js';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { State } from '../graph/state';
import { calculateSatelliteScore } from '../satelliteScore/satellite-scorer';

/**
 * Calculates the cost of moving from the current state to the next state.
 */
export function edgeCostFunction(
  currentState: State,
  satellites: satellite.SatRec[],
) {
  const satelliteScores = satellites
    .map((satrec) =>
      calculateSatelliteScore(
        currentState.latitude,
        currentState.longitude,
        currentState.altitude,
        satrec,
        currentState.time,
      ),
    )
    .filter((score) => score !== null)
    .sort((a, b) => b - a)
    .slice(0, PATHFINDING_DEFAULTS.TOP_SATELLITES_COUNT);

  const score1 = satelliteScores[0] ?? 0;
  const score2 = satelliteScores[1] ?? 0;

  const avgSignalQuality =
    (score1 + score2) / PATHFINDING_DEFAULTS.ACTIVE_LINKS_COUNT;

  const penalty = 1 - avgSignalQuality;

  const distance = PATHFINDING_DEFAULTS.DISTANCE_TO_NEXT_NODE_KM;

  return (
    distance *
    (PATHFINDING_DEFAULTS.W_DIST + PATHFINDING_DEFAULTS.W_CONN * penalty)
  );
}
