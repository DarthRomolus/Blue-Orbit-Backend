import { Coordinates } from 'src/common/types/coordinates';
import type { State, ScoredState, ChildrenGroup } from '../graph/state';
import * as satellite from 'satellite.js';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { nodesBuilder } from '../graph/nodes-builder';
import { calculateNodeScores } from './cost-function';
import { propagateSatellitesToEcf } from './edge-cost';
import { MinHeap } from './min-heap';
import { getGreatCircleDistanceKm } from 'src/common/utils/geo-calculations.utils';
import { SatelliteTle } from 'src/common/types/reducedSatelliteData';

/**
 * Generates a unique string key for a state to avoid revisiting.
 * Rounds coordinates to 2 decimal places (~1.1km) and buckets bearing by 15°.
 */
function stateKey(s: State): string {
  const lat = s.latitude.toFixed(2);
  const lon = s.longitude.toFixed(2);
  const bucketSize = PATHFINDING_DEFAULTS.BEARING_BUCKET_SIZE_DEG;
  const bearingBucket = Math.round(s.bearingDegrees / bucketSize) * bucketSize;
  return `${lat},${lon},${bearingBucket}`;
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
  satellites: SatelliteTle[],
) {
  // Pre-parse all TLE strings into SatRec objects ONCE (eliminates millions of redundant parses)
  const satrecs: satellite.SatRec[] = [];
  for (const sat of satellites) {
    try {
      satrecs.push(satellite.twoline2satrec(sat.line1, sat.line2));
    } catch {
      // Skip invalid TLEs
    }
  }

  let lastState: State = initialState;
  const openList = new MinHeap();
  const closedSet = new Set<string>();
  const ecfCache = new Map<number, satellite.EcfVec3<number>[]>();
  let iterations = 0;

  openList.push({
    state: { ...initialState, costToPoint: 0, parentNode: null, signalQuality: 1.0 },
    fCost: 0,
  });

  while (
    openList.size > 0 &&
    iterations <= PATHFINDING_DEFAULTS.MAX_ITERATIONS
  ) {
    iterations++;

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

    const childrenStates: ChildrenGroup = nodesBuilder(currentState, distanceToGoal);

    const children = [
      childrenStates.left,
      childrenStates.right,
      childrenStates.straight,
    ];

    const childTime = children[0].time.getTime();
    let ecfPositions = ecfCache.get(childTime);
    if (!ecfPositions) {
      ecfPositions = propagateSatellitesToEcf(satrecs, children[0].time);
      ecfCache.set(childTime, ecfPositions);
    }

    for (const child of children) {
      child.parentNode = currentState;

      const childKey = stateKey(child);
      if (closedSet.has(childKey)) continue;

      const timeDeltaSeconds = (child.time.getTime() - currentState.time.getTime()) / 1000;
      const distanceKm = (PATHFINDING_DEFAULTS.DEFAULT_SPEED_KMH / 3600) * timeDeltaSeconds;

      const scores = calculateNodeScores(child, goal, ecfPositions, distanceKm);
      child.costToPoint = scores.gScore;

      openList.push({
        state: child,
        fCost: scores.fScore,
      });
    }
  }

  return {
    path: [],
    totalCost: Infinity,
    nodesExplored: iterations,
    success: false,
  };
}
