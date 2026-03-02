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
 *
 * Uses a 3D ECF bounding box to skip the expensive ecfToLookAngles
 * trigonometry for satellites that are obviously too far away.
 */
export function edgeCostFunction(
  currentState: State,
  satelliteEcfPositions: satellite.EcfVec3<number>[],
  distanceKm: number,
) {
  // Convert plane to ECF once per node (geodeticToEcf doesn't need gmst)
  const observerEcf = satellite.geodeticToEcf({
    longitude: satellite.degreesToRadians(currentState.longitude),
    latitude: satellite.degreesToRadians(currentState.latitude),
    height: currentState.altitude,
  });


  let topScore1 = 0;
  let topScore2 = 0;

  for (let i = 0; i < satelliteEcfPositions.length; i++) {
    const ecf = satelliteEcfPositions[i];

   
    if (
      Math.abs(ecf.x - observerEcf.x) > PATHFINDING_DEFAULTS.MIN_SATELLITE_DISTANCE_FROM_PLANE_KM ||
      Math.abs(ecf.y - observerEcf.y) > PATHFINDING_DEFAULTS.MIN_SATELLITE_DISTANCE_FROM_PLANE_KM ||
      Math.abs(ecf.z - observerEcf.z) > PATHFINDING_DEFAULTS.MIN_SATELLITE_DISTANCE_FROM_PLANE_KM
    ) {
      continue; 
    }

    const score = calculateSatelliteScore(
      currentState.latitude,
      currentState.longitude,
      currentState.altitude,
      ecf,
    );

    if (score !== null) {
      if (score > topScore1) {
        topScore2 = topScore1;
        topScore1 = score;
      } else if (score > topScore2) {
        topScore2 = score;
      }
    }
  }

  const avgSignalQuality =
    (topScore1 + topScore2) / PATHFINDING_DEFAULTS.ACTIVE_LINKS_COUNT;

  const penalty = 1 - avgSignalQuality;

  return (
    distanceKm *
    (PATHFINDING_DEFAULTS.W_DIST + PATHFINDING_DEFAULTS.W_CONN * penalty)
  );
}

