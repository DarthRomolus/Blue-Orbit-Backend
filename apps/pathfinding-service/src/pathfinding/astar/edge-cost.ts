import * as satellite from 'satellite.js';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { State } from '../graph/state';
import { calculateSatelliteScore } from '../satelliteScore/satellite-scorer';
import { SatelliteTle } from 'src/common/types/reducedSatelliteData';

/**
 * Parses TLE data and propagates all satellites to the given time,
 * returning their ECF positions. This is the heavy SGP4 work —
 * call once per timestamp and reuse for all children at that time.
 */
export function propagateSatellitesToEcf(
  reducedSatelliteData: SatelliteTle[],
  time: Date,
): satellite.EcfVec3<number>[] {
  const gmst = satellite.gstime(time);
  const ecfPositions: satellite.EcfVec3<number>[] = [];

  for (const data of reducedSatelliteData) {
    try {
      const satrec = satellite.twoline2satrec(data.line1, data.line2);
      const positionAndVelocity = satellite.propagate(satrec, time);

      if (!positionAndVelocity) continue;

      const positionEci =
        positionAndVelocity.position as satellite.EciVec3<number>;
      if (!positionEci) continue;

      const ecf = satellite.eciToEcf(positionEci, gmst);
      ecfPositions.push(ecf);
    } catch {
      // Skip satellites with invalid TLE data
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

  const distance = PATHFINDING_DEFAULTS.DISTANCE_TO_NEXT_NODE_KM;

  return (
    distance *
    (PATHFINDING_DEFAULTS.W_DIST + PATHFINDING_DEFAULTS.W_CONN * penalty)
  );
}
