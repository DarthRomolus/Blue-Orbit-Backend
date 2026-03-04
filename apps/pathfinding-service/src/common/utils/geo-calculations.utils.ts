import {
  VISIBILITY_EQUATION_VARIABLES,
  LOCATION_COVERAGE_EQUATION_VARIABLES,
} from 'src/common/constants/equation.constants';
import { ANGLES_DEFAULTS } from 'src/common/constants/angles.constants';
import type { Coordinates } from '../types/coordinates';
import type { State } from '../../pathfinding/graph/state';

/**
 * Converts a flight path into standard GeoJSON format for map display.
 */
export function pathToGeoJSON(path: State[]) {
  if (!path || path.length === 0) return null;

  // Extract coordinates — note that GeoJSON requires [Longitude, Latitude] order
  const coordinates = path.map((state) => [state.longitude, state.latitude]);

  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        properties: {
          name: 'Blue Orbit Flight Path',
          stroke: '#0000ff',
          'stroke-width': 4,
        },
        geometry: {
          type: 'LineString',
          coordinates: coordinates,
        },
      },
      // Start point
      {
        type: 'Feature',
        properties: { markerType: 'Start' },
        geometry: { type: 'Point', coordinates: coordinates[0] },
      },
      // End point
      {
        type: 'Feature',
        properties: { markerType: 'End' },
        geometry: {
          type: 'Point',
          coordinates: coordinates[coordinates.length - 1],
        },
      },
    ],
  };
}
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
export function getGreatCircleDistanceKm(
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
  // Partial overlap (exact geometric calculation)
  const r1Sq = r1 * r1;
  const r2Sq = r2 * r2;

  const angle1 = Math.acos((d * d + r1Sq - r2Sq) / (2 * d * r1));
  const angle2 = Math.acos((d * d + r2Sq - r1Sq) / (2 * d * r2));

  // Heron's formula to calculate the triangle area between centers and intersection points
  const term = (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2);
  const triangleArea = 0.5 * Math.sqrt(Math.max(0, term));
  // Sector areas minus triangle areas
  const intersectionArea = r1Sq * angle1 + r2Sq * angle2 - triangleArea;

  // Return the ratio of how much the target is covered
  const targetArea = Math.PI * r1Sq;
  return intersectionArea / targetArea;
}
export function calculateCoverageScore(
  locationCenter: Coordinates,
  locationRadiusKm: number,
  satelliteCoverageCenter: Coordinates,
  satelliteRadiusKm: number,
): number {
  const distanceBetweenCenters = getGreatCircleDistanceKm(
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
/**
 * Solves the Direct Geodesic Problem on a near-perfect sphere.
 * Calculates destination coordinates given a starting point, distance, and bearing.
 *
 * @param state - The starting state containing latitude and longitude (degrees)
 * @param bearingDegrees - Direction of travel (degrees, 0 = North, 90 = East)
 * @param distanceKm - Distance traveled (kilometers)
 * @returns Coordinates object with the new latitude and longitude
 */
export function calculateDestination(
  state: State,
  bearingDegrees: number,
  distanceKm: number,
): Coordinates {
  // 1. Convert degrees to radians
  const lat1 = toRadians(state.latitude);
  const lon1 = toRadians(state.longitude);
  const brng = toRadians(bearingDegrees);

  // Angular distance
  const angularDistance =
    distanceKm / VISIBILITY_EQUATION_VARIABLES.EARTH_RADIUS_KM;

  // 2. Calculate new latitude
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
      Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(brng),
  );

  // 3. Calculate new longitude
  let lon2 =
    lon1 +
    Math.atan2(
      Math.sin(brng) * Math.sin(angularDistance) * Math.cos(lat1),
      Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2),
    );

  // 4. Normalize longitude — critical!
  // Ensures crossing the International Date Line (180°) wraps correctly,
  // keeping the value always within the range [-180, 180].
  lon2 = ((lon2 + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;

  // 5. Convert back to degrees
  return {
    latitude: toDegrees(lat2),
    longitude: toDegrees(lon2),
  };
}

function toRadians(degrees: number): number {
  return degrees * ANGLES_DEFAULTS.DEGREES_TO_RADIANS;
}

function toDegrees(radians: number): number {
  return radians * ANGLES_DEFAULTS.RADIANS_TO_DEGREES;
}
