import * as satellite from 'satellite.js';
import { Logger } from '@nestjs/common';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { State } from '../graph/state';
import { calculateSatelliteScore } from '../satelliteScore/satellite-scorer';
import { EdgeCostResult } from 'src/common/types/pathfinding.types';

const logger = new Logger('EdgeCost');

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
    } catch (error) {
      logger.warn(`Failed to propagate satellite at index ${satrecs.indexOf(satrec)}: ${error}`);
      continue;
    }
  }

  return ecfPositions;
}

/**
 * Checks if a satellite's ECF position is completely outside of the
 * threshold bounding box relative to the plane's observer ECF.
 */
function isSatelliteOutOfRange(
  satEcf: satellite.EcfVec3<number>, 
  observerEcf: satellite.EcfVec3<number>
): boolean {
  return (
    Math.abs(satEcf.x - observerEcf.x) > PATHFINDING_DEFAULTS.MIN_SATELLITE_DISTANCE_FROM_PLANE_KM ||
    Math.abs(satEcf.y - observerEcf.y) > PATHFINDING_DEFAULTS.MIN_SATELLITE_DISTANCE_FROM_PLANE_KM ||
    Math.abs(satEcf.z - observerEcf.z) > PATHFINDING_DEFAULTS.MIN_SATELLITE_DISTANCE_FROM_PLANE_KM
  );
}

/**
 * Calculates the average signal quality from top scoring satellites
 */
function calculateAverageSignalQuality(topScore1: number, topScore2: number): number {
  return (topScore1 + topScore2) / PATHFINDING_DEFAULTS.ACTIVE_LINKS_COUNT;
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
): EdgeCostResult {
  const altitudeKm = currentState.altitude / PATHFINDING_DEFAULTS.METERS_PER_KM;
  const observerEcf:satellite.EcfVec3<number> = satellite.geodeticToEcf({
    longitude: satellite.degreesToRadians(currentState.longitude),
    latitude: satellite.degreesToRadians(currentState.latitude),
    height: altitudeKm,
  });

  let topScore1 = 0;
  let topScore2 = 0;

  for (let i = 0; i < satelliteEcfPositions.length; i++) {
    const ecf:satellite.EcfVec3<number> = satelliteEcfPositions[i];

    if (isSatelliteOutOfRange(ecf, observerEcf)) {
      continue; 
    }

    const score = calculateSatelliteScore(
      currentState.latitude,
      currentState.longitude,
      altitudeKm,
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

  const avgSignalQuality = calculateAverageSignalQuality(topScore1, topScore2);

  const penalty = Math.min(1 - avgSignalQuality, PATHFINDING_DEFAULTS.MAX_PENALTY_CAP);

  const cost =
    distanceKm *
    (PATHFINDING_DEFAULTS.W_DIST + PATHFINDING_DEFAULTS.W_CONN * penalty);

  return { cost, signalQuality: avgSignalQuality };
}

