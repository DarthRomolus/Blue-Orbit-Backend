import {
  VISIBILITY_EQUATION_VARIABLES,
  LOCATION_COVERAGE_EQUATION_VARIABLES,
} from 'src/common/constants/equation.constants';
import { ANGLES_DEFAULTS } from 'src/common/constants/angles.constants';
import type { Coordinates } from '../types/coordinates';
export function calculateEffectiveRadius(
  satelliteAltitudeKm: number,
  minElevationAngle: number = ANGLES_DEFAULTS.MINIMUM_VISIBILITY_ANGLE,
): number {
  const minElevationRad =
    minElevationAngle * ANGLES_DEFAULTS.DEGREES_TO_RADIANS;

  const earthRadius = VISIBILITY_EQUATION_VARIABLES.EARTH_RADIUS_KM;

  const cosAngleForRadius =
    (earthRadius / (earthRadius + satelliteAltitudeKm)) *
    Math.cos(minElevationRad);
  const angleForRadiusInRadians =
    Math.acos(cosAngleForRadius) - minElevationRad;
  const coverageRadiusKm = angleForRadiusInRadians * earthRadius;
  return coverageRadiusKm;
}
function getDistanceKm(
  satelliteCoverageCenter: Coordinates,
  locationCenter: Coordinates,
): number {
  const deltaLatitude =
    (locationCenter.latitude - satelliteCoverageCenter.latitude) *
    ANGLES_DEFAULTS.DEGREES_TO_RADIANS;
  const deltaLongitude =
    (locationCenter.longitude - satelliteCoverageCenter.longitude) *
    ANGLES_DEFAULTS.DEGREES_TO_RADIANS;

  const halfChordLength =
    Math.cos(
      satelliteCoverageCenter.latitude * ANGLES_DEFAULTS.DEGREES_TO_RADIANS,
    ) *
      Math.cos(locationCenter.latitude * ANGLES_DEFAULTS.DEGREES_TO_RADIANS) *
      Math.sin(deltaLongitude / 2) *
      Math.sin(deltaLongitude / 2) +
    Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2);

  const angularDistance =
    2 * Math.atan2(Math.sqrt(halfChordLength), Math.sqrt(1 - halfChordLength));

  return VISIBILITY_EQUATION_VARIABLES.EARTH_RADIUS_KM * angularDistance;
}
function calculateCoveragePercentage(
  distanceKm: number,
  locationRadiusKm: number,
  satelliteRadiusKm: number,
): number {
  const r1 = locationRadiusKm;
  const r2 = satelliteRadiusKm;
  const d = distanceKm;

  if (d <= 0 || r1 <= 0 || r2 <= 0) {
    return 0;
  }
  // חפיפה חלקית (חישוב גיאומטרי מדויק)
  const r1Sq = r1 * r1;
  const r2Sq = r2 * r2;

  const angle1 = Math.acos((d * d + r1Sq - r2Sq) / (2 * d * r1));
  const angle2 = Math.acos((d * d + r2Sq - r1Sq) / (2 * d * r2));

  // נוסחת הרון לחישוב שטח המשולש שבין המרכזים לנקודות החיתוך
  const term = (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2);
  const triangleArea = 0.5 * Math.sqrt(Math.max(0, term));
  // שטח הגזרות פחות שטח המשולשים
  const intersectionArea = r1Sq * angle1 + r2Sq * angle2 - triangleArea;

  // החזרת היחס של כמה המטרה מכוסה
  const targetArea = Math.PI * r1Sq;
  return intersectionArea / targetArea;
}
export function calculateCoverageScore(
  locationCenter: Coordinates,
  locationRadiusKm: number,
  satelliteCoverageCenter: Coordinates,
  satelliteRadiusKm: number,
): number {
  const distanceBetweenCenters = getDistanceKm(
    satelliteCoverageCenter,
    locationCenter,
  );

  if (distanceBetweenCenters >= locationRadiusKm + satelliteRadiusKm) {
    return LOCATION_COVERAGE_EQUATION_VARIABLES.NO_COVERAGE;
  }
  if (satelliteRadiusKm >= distanceBetweenCenters + locationRadiusKm) {
    return LOCATION_COVERAGE_EQUATION_VARIABLES.MAX_COVERAGE;
  }
  if (distanceBetweenCenters + satelliteRadiusKm <= locationRadiusKm) {
    return Math.pow(satelliteRadiusKm / locationRadiusKm, 2);
  }
  return calculateCoveragePercentage(
    distanceBetweenCenters,
    locationRadiusKm,
    satelliteRadiusKm,
  );
}
