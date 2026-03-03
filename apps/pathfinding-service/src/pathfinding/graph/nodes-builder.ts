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
 * Builds the children states for the current state (Hybrid A*).
 *
 * The actual State bearings are kept at FULL PRECISION for accurate physics.
 * The bearing bucketing (15° grid) happens ONLY in the stateKey() function
 * inside astar-engine.ts for closedSet deduplication.
 *
 * This separation between Search Space (coarse) and Action Space (precise)
 * is the core principle of Hybrid A*.
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
  // Determine maneuver tier.
  // forceMicroSteps (set by the engine's look-ahead radar) overrides distance-based tiers.
  const isOceanic =
    !forceMicroSteps &&
    distanceToGoalKm > PATHFINDING_DEFAULTS.DYNAMIC_STEP_OCEANIC_THRESHOLD_KM;
  const isMacro =
    !forceMicroSteps &&
    !isOceanic &&
    distanceToGoalKm > PATHFINDING_DEFAULTS.DYNAMIC_STEP_DISTANCE_THRESHOLD_KM;

  const timeStepSeconds = isOceanic
    ? PATHFINDING_DEFAULTS.DYNAMIC_STEP_OCEANIC_SECONDS
    : isMacro
      ? PATHFINDING_DEFAULTS.DYNAMIC_STEP_FAST_SECONDS
      : PATHFINDING_DEFAULTS.DYNAMIC_STEP_FINE_SECONDS;

  const speedKmPerSec = PATHFINDING_DEFAULTS.DEFAULT_SPEED_KMH / 3600;
  const distanceKm = speedKmPerSec * timeStepSeconds;

  const nextTime = new Date(
    currentState.time.getTime() + timeStepSeconds * 1000,
  );

  // Select turning constants based on maneuver tier (Oceanic vs Macro vs Micro)
  const avgLeftTurn = isOceanic
    ? PATHFINDING_DEFAULTS.OCEANIC_AVG_LEFT_TURN_BEARING_CHANGE
    : isMacro
      ? PATHFINDING_DEFAULTS.MACRO_AVG_LEFT_TURN_BEARING_CHANGE
      : PATHFINDING_DEFAULTS.MICRO_AVG_LEFT_TURN_BEARING_CHANGE;
  const avgRightTurn = isOceanic
    ? PATHFINDING_DEFAULTS.OCEANIC_AVG_RIGHT_TURN_BEARING_CHANGE
    : isMacro
      ? PATHFINDING_DEFAULTS.MACRO_AVG_RIGHT_TURN_BEARING_CHANGE
      : PATHFINDING_DEFAULTS.MICRO_AVG_RIGHT_TURN_BEARING_CHANGE;
  const finalLeftTurn = isOceanic
    ? PATHFINDING_DEFAULTS.OCEANIC_LEFT_TURN_STATE_BEARING_CHANGE
    : isMacro
      ? PATHFINDING_DEFAULTS.MACRO_LEFT_TURN_STATE_BEARING_CHANGE
      : PATHFINDING_DEFAULTS.MICRO_LEFT_TURN_STATE_BEARING_CHANGE;
  const finalRightTurn = isOceanic
    ? PATHFINDING_DEFAULTS.OCEANIC_RIGHT_TURN_STATE_BEARING_CHANGE
    : isMacro
      ? PATHFINDING_DEFAULTS.MACRO_RIGHT_TURN_STATE_BEARING_CHANGE
      : PATHFINDING_DEFAULTS.MICRO_RIGHT_TURN_STATE_BEARING_CHANGE;

  // Position is calculated using the average bearing during the turn arc.
  // The final state bearing is the full turn amount (precise, not snapped).
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

