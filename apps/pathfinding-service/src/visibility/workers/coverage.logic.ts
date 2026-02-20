import { SatellitePositionGeodetic } from 'src/common/types/satellite';
import { Coordinates } from 'src/common/types/coordinates';
import { ReducedSatelliteData } from 'src/common/types/reducedSatelliteData';
import * as satellite from 'satellite.js';
import {
  calculateCoverageScore,
  calculateEffectiveRadius,
} from 'src/common/utils/geo-calculations.utils';
import { TIME_DEFAULTS } from 'src/common/constants/time.constants';

function buildSatrecs(
  reducedSatelliteData: ReducedSatelliteData[],
): satellite.SatRec[] {
  const satrecs: satellite.SatRec[] = [];
  for (const data of reducedSatelliteData) {
    try {
      satrecs.push(satellite.twoline2satrec(data.line1, data.line2));
    } catch {}
  }
  return satrecs;
}
function calculateSatellitePositionBySatrec(
  satrec: satellite.SatRec,
  date: Date,
): SatellitePositionGeodetic | undefined {
  const positionAndVelocity = satellite.propagate(satrec, date);
  if (
    !positionAndVelocity?.position ||
    typeof positionAndVelocity.position !== 'object'
  ) {
    return undefined;
  }
  const positionEci: satellite.EciVec3<number> = positionAndVelocity.position;
  const gmst = satellite.gstime(date);
  const positionGdRadians: SatellitePositionGeodetic = satellite.eciToGeodetic(
    positionEci,
    gmst,
  );
  const positionGdDegrees: SatellitePositionGeodetic = {
    latitude: satellite.radiansToDegrees(positionGdRadians.latitude),
    longitude: satellite.radiansToDegrees(positionGdRadians.longitude),
    height: positionGdRadians.height,
  };
  return positionGdDegrees;
}
export function timeStepCoverageScore(
  startDate: Date,
  endDate: Date,
  locationCenter: Coordinates,
  locationRadiusKm: number,
  stepMinutes: number = TIME_DEFAULTS.FINE_STEP_MINUTES,
  reducedSatelliteData: ReducedSatelliteData[],
): Float64Array {
  const satrecs: satellite.SatRec[] = buildSatrecs(reducedSatelliteData);

  const stepMs = stepMinutes * TIME_DEFAULTS.MS_IN_MINUTE;
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();
  const slotCount = Math.floor((endTimestamp - startTimestamp) / stepMs) + 1;
  const scores = new Float64Array(slotCount);

  const currentTime = new Date(startTimestamp);
  let timestamp = startTimestamp;

  for (let i = 0; i < slotCount; i++) {
    currentTime.setTime(timestamp);
    let timeWindowScore = 0;

    for (const satrec of satrecs) {
      const positionGd = calculateSatellitePositionBySatrec(
        satrec,
        currentTime,
      );
      if (!positionGd) {
        continue;
      }
      const satelliteCoverageCenter: Coordinates = {
        latitude: positionGd.latitude,
        longitude: positionGd.longitude,
      };
      const satelliteCoverageRadius = calculateEffectiveRadius(
        positionGd.height,
      );
      const satelliteScore = calculateCoverageScore(
        locationCenter,
        locationRadiusKm,
        satelliteCoverageCenter,
        satelliteCoverageRadius,
      );

      timeWindowScore += satelliteScore;
    }
    scores[i] = timeWindowScore;
    timestamp += stepMs;
  }

  return scores;
}
