import { calculateDestination } from 'src/common/utils/geo-calculations.utils';
import { ChildrenStates, State } from './state';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { TIME_DEFAULTS } from 'src/common/constants/time.constants';

/**
 * Normalizes the bearing to be within the range [0, 360).
 */
function normalizeBearing(bearing: number): number {
  return ((bearing % 360) + 360) % 360;
}

/**
 * Builds the children states for the current state.
 * 
 * @param currentState - The current state.
 * @returns The children states.
 */
export function nodesBuilder(currentState: State): ChildrenStates {
  const distanceKm = PATHFINDING_DEFAULTS.DISTANCE_TO_NEXT_NODE_KM;
  const nextTime = new Date(
    currentState.time.getTime() + PATHFINDING_DEFAULTS.TIME_STEP_SECONDS * 1000,
  );
  const leftCoords = calculateDestination(
    currentState,

    normalizeBearing(
      currentState.bearingDegrees +
        PATHFINDING_DEFAULTS.AVG_LEFT_TURN_BEARING_CHANGE,
    ),
    distanceKm,
  );

  const rightCoords = calculateDestination(
    currentState,
    normalizeBearing(
      currentState.bearingDegrees +
        PATHFINDING_DEFAULTS.AVG_RIGHT_TURN_BEARING_CHANGE,
    ),
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
        currentState.bearingDegrees +
          PATHFINDING_DEFAULTS.LEFT_TURN_STATE_BEARING_CHANGE,
      ),
      time: nextTime,
    },
    right: {
      ...currentState,
      latitude: rightCoords.latitude,
      longitude: rightCoords.longitude,
      bearingDegrees: normalizeBearing(
        currentState.bearingDegrees +
          PATHFINDING_DEFAULTS.RIGHT_TURN_STATE_BEARING_CHANGE,
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
