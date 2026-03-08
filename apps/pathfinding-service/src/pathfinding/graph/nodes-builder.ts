import { calculateDestination } from 'src/common/utils/geo-calculations.utils';
import { ChildrenGroup, State } from './state';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';

import {
  determineManeuverTier,
  getManeuverConstants,
} from '../../common/utils/nodes-builder.utils';

/**
 * Normalizes the bearing to be within the range [0, 360).
 */
function normalizeBearing(bearing: number): number {
  //TODO: לבדוק אם כדאי לנרמל ל-15
  return ((bearing % 360) + 360) % 360;
}

/**
 * Builds the children states for the current state (Hybrid A*).
 *
 * The actual State bearings are kept at FULL PRECISION for accurate physics.
 * The bearing bucketing (15° grid) happens ONLY in the stateKey() function
 * inside astar-engine.ts for closedSet deduplication.
 *
 *
 * @param currentState - The current state.
 * @param distanceToGoalKm - Distance from current state to the goal.
 * @returns The children states.
 */
export function nodesBuilder(
  currentState: State,
  distanceToGoalKm: number,
  forceMicroSteps = false,
): ChildrenGroup {
  const { isOceanic, isMacro } = determineManeuverTier(
    distanceToGoalKm,
    forceMicroSteps,
  );

  const {
    timeStepSeconds,
    avgLeftTurn,
    avgRightTurn,
    finalLeftTurn,
    finalRightTurn,
  } = getManeuverConstants(isOceanic, isMacro);

  const speedKmPerSec =
    PATHFINDING_DEFAULTS.DEFAULT_SPEED_KMH /
    PATHFINDING_DEFAULTS.SECONDS_PER_HOUR;
  const distanceKm = speedKmPerSec * timeStepSeconds;

  const nextTime = new Date(
    currentState.time.getTime() +
      timeStepSeconds * PATHFINDING_DEFAULTS.MS_PER_SECOND,
  );

  const leftCoords = calculateDestination(
    currentState,
    normalizeBearing(currentState.bearingDegrees + avgLeftTurn),
    distanceKm,
  );

  const rightCoords = calculateDestination(
    currentState,
    normalizeBearing(currentState.bearingDegrees + avgRightTurn),
    distanceKm,
  );

  const straightCoords = calculateDestination(
    currentState,
    currentState.bearingDegrees,
    distanceKm,
  );

  return {
    left: {
      ...currentState,
      latitude: leftCoords.latitude,
      longitude: leftCoords.longitude,
      bearingDegrees: normalizeBearing(
        currentState.bearingDegrees + finalLeftTurn,
      ),
      time: nextTime,
    },
    right: {
      ...currentState,
      latitude: rightCoords.latitude,
      longitude: rightCoords.longitude,
      bearingDegrees: normalizeBearing(
        currentState.bearingDegrees + finalRightTurn,
      ),
      time: nextTime,
    },
    straight: {
      ...currentState,
      latitude: straightCoords.latitude,
      longitude: straightCoords.longitude,
      bearingDegrees: currentState.bearingDegrees,
      time: nextTime,
    },
  };
}
