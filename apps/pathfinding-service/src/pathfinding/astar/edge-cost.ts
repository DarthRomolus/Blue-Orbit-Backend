import * as satellite from 'satellite.js';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { State } from '../graph/state';
import { calculateSatelliteScore } from '../satelliteScore/satellite-scorer';
import { getGreatCircleDistanceKm } from 'src/common/utils/geo-calculations.utils';

export function edgeCostFunction(
  currentState: State,
  satellites: satellite.SatRec[],
  lastState: State,
) {
  const satelliteScores = satellites
    .map((satrec) =>
      calculateSatelliteScore(
        currentState.latitude,
        currentState.longitude,
        currentState.altitude,
        satrec,
        currentState.time,
      ),
    )
    .filter((score) => score !== null)
    .sort((a, b) => b - a)
    .slice(0, PATHFINDING_DEFAULTS.TOP_SATELLITES_COUNT); // top 4

  const score1 = satelliteScores[0] ?? 0;
  const score2 = satelliteScores[1] ?? 0;

  const avgSignalQuality =
    (score1 + score2) / PATHFINDING_DEFAULTS.ACTIVE_LINKS_COUNT;

  const penalty = 1 - avgSignalQuality;

  const distance = getGreatCircleDistanceKm(
    { latitude: currentState.latitude, longitude: currentState.longitude },
    { latitude: lastState.latitude, longitude: lastState.longitude },
  );

  return distance * (PATHFINDING_DEFAULTS.W_DIST + PATHFINDING_DEFAULTS.W_CONN * penalty);
}
