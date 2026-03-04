import { Coordinates } from 'src/common/types/coordinates';
import type { State, ScoredState, ChildrenGroup } from '../graph/state';
import * as satellite from 'satellite.js';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { nodesBuilder } from '../graph/nodes-builder';
import { calculateNodeScores } from './cost-function';
import { edgeCostFunction } from './edge-cost';
import { MinHeap } from './min-heap';
import { getGreatCircleDistanceKm } from 'src/common/utils/geo-calculations.utils';
import { SatelliteTle } from 'src/common/types/reducedSatelliteData';
import { Logger } from '@nestjs/common';
import { buildSatrecs } from 'src/common/utils/satellite.utils';
import { reconstructPath, shouldForceMicroSteps, getOrComputeEcfPositions } from '../../common/utils/astar.utils';
import { AstarResult } from 'src/common/types/pathfinding.types';

const logger = new Logger('AstarEngine');


function stateKey(s: State): string {
  const lat = s.latitude.toFixed(2);
  const lon = s.longitude.toFixed(2);
  const bucketSize = PATHFINDING_DEFAULTS.BEARING_BUCKET_SIZE_DEG;
  const bearingBucket = Math.round(s.bearingDegrees / bucketSize) * bucketSize;
  return `${lat},${lon},${bearingBucket}`;//TODO: לעבור על זה, לבדוק bitmap
}

export function astarEngine(
  initialState: State,
  goal: Coordinates,
  satellites: SatelliteTle[],
): AstarResult {
  const satrecs = buildSatrecs(satellites);

  let lastState: State = initialState;
  const openList = new MinHeap();
  const closedSet = new Set<string>();
  const ecfCache = new Map<number, satellite.EcfVec3<number>[]>();
  let iterations = 0;

  openList.push({
    state: { 
      ...initialState, 
      costToPoint: 0, 
      parentNode: null, 
      signalQuality: PATHFINDING_DEFAULTS.MAX_SIGNAL_QUALITY 
    },
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

    const forceMicroSteps = shouldForceMicroSteps(currentState, distanceToGoal, ecfCache, satrecs);

    const childrenStates: ChildrenGroup = nodesBuilder(currentState, distanceToGoal, forceMicroSteps);

    const children = [
      childrenStates.left,
      childrenStates.right,
      childrenStates.straight,
    ];

    const ecfPositions = getOrComputeEcfPositions(children[0].time, ecfCache, satrecs);

    for (const child of children) {
      child.parentNode = currentState;

      const childKey = stateKey(child);
      if (closedSet.has(childKey)) continue;

      const timeDeltaSeconds = (child.time.getTime() - currentState.time.getTime()) / PATHFINDING_DEFAULTS.MS_PER_SECOND;
      const distanceKm = (PATHFINDING_DEFAULTS.DEFAULT_SPEED_KMH / PATHFINDING_DEFAULTS.SECONDS_PER_HOUR) * timeDeltaSeconds;

      const scores = calculateNodeScores(child, goal, ecfPositions, distanceKm);
      child.costToPoint = scores.gScore;
      child.signalQuality = scores.signalQuality;

      if (iterations % 100 === 0 && child === children[2]) { // straight child only
        logger.debug(`[A* #${iterations}] lat=${child.latitude.toFixed(2)}, lon=${child.longitude.toFixed(2)}, signal=${scores.signalQuality.toFixed(4)}, forceMicro=${forceMicroSteps}, ecfCount=${ecfPositions.length}`);
      }
      if (iterations === 1 && child === children[0]) {
        const obsEcf = satellite.geodeticToEcf({
          longitude: satellite.degreesToRadians(child.longitude),
          latitude: satellite.degreesToRadians(child.latitude),
          height: child.altitude,
        });
        const sat0 = ecfPositions[0];
        logger.debug(`altitude=${child.altitude}, observer ECF: x=${obsEcf.x.toFixed(1)}, y=${obsEcf.y.toFixed(1)}, z=${obsEcf.z.toFixed(1)}`);
        logger.debug(`sat[0] ECF: x=${sat0.x.toFixed(1)}, y=${sat0.y.toFixed(1)}, z=${sat0.z.toFixed(1)}`);
        logger.debug(`diff: dx=${Math.abs(sat0.x - obsEcf.x).toFixed(1)}, dy=${Math.abs(sat0.y - obsEcf.y).toFixed(1)}, dz=${Math.abs(sat0.z - obsEcf.z).toFixed(1)}, threshold=${PATHFINDING_DEFAULTS.MIN_SATELLITE_DISTANCE_FROM_PLANE_KM}`);
      }

      openList.push({
        state: child,
        fCost: scores.fScore,
      });
    }
    lastState=currentState;
  }

  return {
    path: reconstructPath(lastState),
    totalCost: Infinity,
    nodesExplored: iterations,
    success: false,
  };
}
