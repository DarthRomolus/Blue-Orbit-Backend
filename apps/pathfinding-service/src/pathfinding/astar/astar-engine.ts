import { Coordinates } from 'src/common/types/coordinates';
import type { State, StatesList, ChildrenStates } from '../graph/state';
import * as satellite from 'satellite.js';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { nodesBuilder } from '../graph/nodes-builder';
import { calculateNodeScores } from './cost-function';
import { MinHeap } from './min-heap';
import { getGreatCircleDistanceKm } from 'src/common/utils/geo-calculations.utils';

/**
 * Generates a unique string key for a state to avoid revisiting.
 * Rounds coordinates to 4 decimal places (~11m precision) and includes bearing.
 */
function stateKey(s: State): string {
  return `${s.latitude.toFixed(4)},${s.longitude.toFixed(4)},${s.bearingDegrees}`;
}

/**
 * Reconstructs the path from the goal state back to the start
 * by following parentNode pointers.
 */
function reconstructPath(goalState: State): State[] {
  const path: State[] = [];
  let current: State | null = goalState;

  while (current !== null) {
    path.push(current);
    current = current.parentNode;
  }

  return path.reverse();
}

export function astarEngine(
  initialState: State,
  goal: Coordinates,
  satellites: satellite.SatRec[],
) {
  const openList = new MinHeap();
  const closedSet = new Set<string>();
  let iterations = 0;

  openList.push({
    state: { ...initialState, costToPoint: 0, parentNode: null },
    Fcost: 0,
  });

  while (
    openList.size > 0 &&
    iterations <= PATHFINDING_DEFAULTS.MAX_ITERATIONS
  ) {
    const minNode = openList.pop();
    if (!minNode) break;

    const currentState = minNode.state;

    const distanceToGoal = getGreatCircleDistanceKm(
      { latitude: currentState.latitude, longitude: currentState.longitude },
      goal,
    );

    if (distanceToGoal <= PATHFINDING_DEFAULTS.GOAL_RADIUS_KM) {
      return {
        path: reconstructPath(currentState),
        totalCost: currentState.costToPoint,
        nodesExplored: iterations,
        success: true,
      };
    }

    const key = stateKey(currentState);
    if (closedSet.has(key)) {
      continue;
    }
    closedSet.add(key);

    const childrenStates: ChildrenStates = nodesBuilder(currentState);

    const children = [childrenStates.left, childrenStates.right, childrenStates.straight];

    for (const child of children) {
      child.parentNode = currentState;

      const childKey = stateKey(child);
      if (closedSet.has(childKey)) continue;

      const scores = calculateNodeScores(child, goal, satellites);
      child.costToPoint = scores.gScore;

      openList.push({
        state: child,
        Fcost: scores.fScore,
      });
    }

    iterations++;
  }

  return {
    path: [],
    totalCost: Infinity,
    nodesExplored: iterations,
    success: false,
  };
}
