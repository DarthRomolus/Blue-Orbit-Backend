import { VISIBILITY_EQUATION_VARIABLES } from 'src/common/constants/equation.constants';
import { ANGLES_DEFAULTS } from 'src/common/constants/angles.constants';
import type { Coordinates } from '../types/coordinates';
export function calculateEffectiveRadius(
  satelliteAltitudeKm,
  minElevationAngle: number = 30,
): number {
  // ------------------------------------------------------------------DEV
  const heightKm = satelliteAltitudeKm;
  const minElevationRad =
    minElevationAngle * ANGLES_DEFAULTS.DEGREES_TO_RADIANS; //change to radians

  const earthRadius = VISIBILITY_EQUATION_VARIABLES.EARTH_RADIUS_KM;

  const cosAngleForRadius =
    (earthRadius / (earthRadius + heightKm)) * Math.cos(minElevationRad);
  const angleForRadiusInRadians =
    Math.acos(cosAngleForRadius) - minElevationRad;
  const covrageRadiusKm = angleForRadiusInRadians * earthRadius;
  return covrageRadiusKm;
}
export function getDistanceKm(
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

export function doCirclesIntersect(
  locationCenter: Coordinates,
  locationRadiusKm: number,
  satelliteCoverageCenter: Coordinates,
  satelliteRadiusKm: number,
): boolean {
  // 1. חשב מרחק בין המרכזים
  const distance = getDistanceKm(satelliteCoverageCenter, locationCenter);

  // 2. אם המרחק קטן או שווה לסכום הרדיוסים - יש חפיפה (או השקה)
  return distance <= locationRadiusKm + satelliteRadiusKm;
}
