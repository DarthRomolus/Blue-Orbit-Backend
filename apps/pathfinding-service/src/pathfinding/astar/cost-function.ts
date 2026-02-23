import { Coordinates } from 'src/common/types/coordinates';
import { heuristic } from './heuristic';
import { State } from '../graph/state';

export function costFunction(
  pathCost: number,
  goal: Coordinates,
  currentState: State,
) {
  const distancePenalty = heuristic(currentState, goal);
}
