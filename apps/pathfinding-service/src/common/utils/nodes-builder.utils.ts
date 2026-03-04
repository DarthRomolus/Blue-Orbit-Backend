import { State } from '../../pathfinding/graph/state';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';

/**
 * Determines the maneuver tier (Micro, Macro, or Oceanic) based on distance
 * to the goal, and whether micro-steps are forced by the look-ahead radar.
 */
export function determineManeuverTier(
  distanceToGoalKm: number,
  forceMicroSteps: boolean,
) {
  const isOceanic =
    !forceMicroSteps &&
    distanceToGoalKm > PATHFINDING_DEFAULTS.DYNAMIC_STEP_OCEANIC_THRESHOLD_KM;
    
  const isMacro =
    !forceMicroSteps &&
    !isOceanic &&
    distanceToGoalKm > PATHFINDING_DEFAULTS.DYNAMIC_STEP_DISTANCE_THRESHOLD_KM;

  return { isOceanic, isMacro };
}

/**
 * Returns the correct turning constants and time step duration 
 * for the current maneuver tier.
 */
export function getManeuverConstants(isOceanic: boolean, isMacro: boolean) {
  const timeStepSeconds = isOceanic
    ? PATHFINDING_DEFAULTS.DYNAMIC_STEP_OCEANIC_SECONDS
    : isMacro
      ? PATHFINDING_DEFAULTS.DYNAMIC_STEP_FAST_SECONDS
      : PATHFINDING_DEFAULTS.DYNAMIC_STEP_FINE_SECONDS;

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

  return { timeStepSeconds, avgLeftTurn, avgRightTurn, finalLeftTurn, finalRightTurn };
}
