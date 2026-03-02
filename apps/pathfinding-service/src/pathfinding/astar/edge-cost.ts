import * as satellite from 'satellite.js';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { State } from '../graph/state';
import { calculateSatelliteScore } from '../satelliteScore/satellite-scorer';

/**
 * Propagates pre-parsed satellite records to the given time,
 * returning their ECF positions. Accepts SatRec[] (already parsed)
 * to avoid redundant twoline2satrec calls.
 */
export function propagateSatellitesToEcf(
  satrecs: satellite.SatRec[],
  time: Date,
): satellite.EcfVec3<number>[] {
  const gmst = satellite.gstime(time);
  const ecfPositions: satellite.EcfVec3<number>[] = [];

  for (const satrec of satrecs) {
    try {
      const positionAndVelocity = satellite.propagate(satrec, time);

      if (!positionAndVelocity) continue;

      const positionEci =
        positionAndVelocity.position as satellite.EciVec3<number>;
      if (!positionEci) continue;

      const ecf = satellite.eciToEcf(positionEci, gmst);
      ecfPositions.push(ecf);
    } catch {
      continue;
    }
  }

  return ecfPositions;
}

/**
 * Calculates the cost of traversing an edge, given pre-computed
 * satellite ECF positions for the child's timestamp.
 */
export function edgeCostFunction(
  currentState: State,
  satelliteEcfPositions: satellite.EcfVec3<number>[],
  distanceKm: number,
) {
  const satelliteScores = satelliteEcfPositions
    .map((ecf) =>
      calculateSatelliteScore(
        currentState.latitude,
        currentState.longitude,
        currentState.altitude,
        ecf,
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

  return (
    distanceKm *
    (PATHFINDING_DEFAULTS.W_DIST + PATHFINDING_DEFAULTS.W_CONN * penalty)
  );
}
