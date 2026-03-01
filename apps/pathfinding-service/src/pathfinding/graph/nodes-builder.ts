import { calculateDestination } from 'src/common/utils/geo-calculations.utils';
import { ChildrenGroup, State } from './state';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';

/**
 * Normalizes the bearing to be within the range [0, 360).
 */
function normalizeBearing(bearing: number): number {
  return ((bearing % 360) + 360) % 360;
}

/**
 * Builds the children states for the current state.
 * Uses a dynamic step size: 60 seconds if far from goal, 10 seconds if close.
 *
 * @param currentState - The current state.
 * @param distanceToGoalKm - Distance from current state to the goal.
 * @returns The children states.
 */
export function nodesBuilder(
  currentState: State,
  distanceToGoalKm: number,
): ChildrenGroup {
  const isFar =
    distanceToGoalKm > PATHFINDING_DEFAULTS.DYNAMIC_STEP_DISTANCE_THRESHOLD_KM;
  const timeStepSeconds = isFar
    ? PATHFINDING_DEFAULTS.DYNAMIC_STEP_FAST_SECONDS
    : PATHFINDING_DEFAULTS.DYNAMIC_STEP_FINE_SECONDS;

  const speedKmPerSec = PATHFINDING_DEFAULTS.DEFAULT_SPEED_KMH / 3600;
  const distanceKm = speedKmPerSec * timeStepSeconds;

  const nextTime = new Date(
    currentState.time.getTime() + timeStepSeconds * 1000,
  );

  // Select turning constants based on maneuver type (Macro vs Micro)
  const avgLeftTurn = isFar
    ? PATHFINDING_DEFAULTS.MACRO_AVG_LEFT_TURN_BEARING_CHANGE
    : PATHFINDING_DEFAULTS.MICRO_AVG_LEFT_TURN_BEARING_CHANGE;
  const avgRightTurn = isFar
    ? PATHFINDING_DEFAULTS.MACRO_AVG_RIGHT_TURN_BEARING_CHANGE
    : PATHFINDING_DEFAULTS.MICRO_AVG_RIGHT_TURN_BEARING_CHANGE;
  const finalLeftTurn = isFar
    ? PATHFINDING_DEFAULTS.MACRO_LEFT_TURN_STATE_BEARING_CHANGE
    : PATHFINDING_DEFAULTS.MICRO_LEFT_TURN_STATE_BEARING_CHANGE;
  const finalRightTurn = isFar
    ? PATHFINDING_DEFAULTS.MACRO_RIGHT_TURN_STATE_BEARING_CHANGE
    : PATHFINDING_DEFAULTS.MICRO_RIGHT_TURN_STATE_BEARING_CHANGE;

  // Turn logic: calculate intermediate position using average bearing,
  // then set the final state bearing to the full turn amount.
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
