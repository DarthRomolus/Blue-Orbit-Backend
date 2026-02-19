import type { Coordinates } from 'src/common/types/coordinates';
import type { State } from '../graph/state';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { getGreatCircleDistanceKm } from 'src/common/utils/geo-calculations.utils';

export function heuristic(state: State, goal: Coordinates): number {
  const distance = getGreatCircleDistanceKm(
    { latitude: state.latitude, longitude: state.longitude },
    goal,
  );

  return PATHFINDING_DEFAULTS.W_DIST * distance;
}
