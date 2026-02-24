import { Coordinates } from 'src/common/types/coordinates';
import type { State, StatesList, ChildrenStates } from '../graph/state';
import * as satellite from 'satellite.js';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { nodesBuilder } from '../graph/nodes-builder';
import { calculateNodeScores } from './cost-function';
export function astarEngine(
  initialState: State,
  goal: Coordinates,
  satellites: satellite.SatRec[],
) {
  let finalState: State;
  let closedList: StatesList[] = [];
  let openList: StatesList[] = [];
  let currentState: State = {
    ...initialState,
  };
  let iterations = 0;
  while (
    currentState.latitude === goal.latitude &&
    currentState.longitude === goal.longitude &&
    iterations <= PATHFINDING_DEFAULTS.MAX_ITERATIONS
  ) {
    let childrenStates: ChildrenStates = nodesBuilder(currentState);
    let leftChildCost = calculateNodeScores(
      childrenStates.left,
      goal,
      satellites,
    );
    let rightChildCost = calculateNodeScores(
      childrenStates.right,
      goal,
      satellites,
    );
    let straightChildCost = calculateNodeScores(
      childrenStates.straight,
      goal,
      satellites,
    );
  }
}
