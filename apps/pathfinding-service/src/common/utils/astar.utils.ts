import { State } from '../../pathfinding/graph/state';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { calculateDestination } from 'src/common/utils/geo-calculations.utils';
import { SatellitePositionGeodetic } from '../types/satellite';
import * as satellite from 'satellite.js';
import {
  edgeCostFunction,
  propagateSatellitesToEcf,
} from '../../pathfinding/astar/edge-cost';

export function reconstructPath(goalState: State): SatellitePositionGeodetic[] {
  const path: SatellitePositionGeodetic[] = [];
  let current: State | null = goalState;

  while (current !== null) {
    const position: SatellitePositionGeodetic = {
      latitude: current.latitude,
      longitude: current.longitude,
      height: current.altitude,
    };
    path.push(position);
    current = current.parentNode;
  }

  return path.reverse();
}

export function shouldForceMicroSteps(
  currentState: State,
  distanceToGoal: number,
  ecfCache: Map<number, satellite.EcfVec3<number>[]>,
  satrecs: satellite.SatRec[],
): boolean {
  if (
    PATHFINDING_DEFAULTS.W_CONN <= 0 ||
    currentState.signalQuality < PATHFINDING_DEFAULTS.ZOOM_IN_SIGNAL_THRESHOLD ||
    distanceToGoal <= PATHFINDING_DEFAULTS.DYNAMIC_STEP_DISTANCE_THRESHOLD_KM
  ) {
    return false;
  }

  const macroDistanceKm =
    (PATHFINDING_DEFAULTS.DEFAULT_SPEED_KMH / PATHFINDING_DEFAULTS.SECONDS_PER_HOUR) * 
    PATHFINDING_DEFAULTS.DYNAMIC_STEP_FAST_SECONDS;

  const probeCoords = calculateDestination(
    currentState,
    currentState.bearingDegrees,
    macroDistanceKm,
  );

  const probeTime = new Date(
    currentState.time.getTime() +
      PATHFINDING_DEFAULTS.DYNAMIC_STEP_FAST_SECONDS * PATHFINDING_DEFAULTS.MS_PER_SECOND,
  );

  const probeEcf = getOrComputeEcfPositions(probeTime, ecfCache, satrecs);

  const probeState: State = {
    ...currentState,
    latitude: probeCoords.latitude,
    longitude: probeCoords.longitude,
    time: probeTime,
  };

  const probeResult = edgeCostFunction(probeState, probeEcf, macroDistanceKm);

  return probeResult.signalQuality < PATHFINDING_DEFAULTS.ZOOM_IN_SIGNAL_THRESHOLD;
}

export function getOrComputeEcfPositions(
  time: Date,
  ecfCache: Map<number, satellite.EcfVec3<number>[]>,
  satrecs: satellite.SatRec[],
): satellite.EcfVec3<number>[] {
  const timeMs = time.getTime();
  let ecfPositions = ecfCache.get(timeMs);
  
  if (!ecfPositions) {
    ecfPositions = propagateSatellitesToEcf(satrecs, time);
    ecfCache.set(timeMs, ecfPositions);
  }
  
  return ecfPositions;
}
