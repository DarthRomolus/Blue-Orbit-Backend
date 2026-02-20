import * as satellite from 'satellite.js';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';

function calculateElevationAngle(
  aircraftLat: number,
  aircraftLon: number,
  aircraftAltKm: number,
  satrec: satellite.SatRec,
  date: Date,
): number | null {
  const positionAndVelocity = satellite.propagate(satrec, date);
  if (!positionAndVelocity) return null;

  const positionEci = positionAndVelocity.position as satellite.EciVec3<number>;
  if (!positionEci) return null;

  const gmst = satellite.gstime(date);
  const satelliteEcf = satellite.eciToEcf(positionEci, gmst);

  const observerGd = {
    longitude: satellite.degreesToRadians(aircraftLon),
    latitude: satellite.degreesToRadians(aircraftLat),
    height: aircraftAltKm,
  };

  const lookAngles = satellite.ecfToLookAngles(observerGd, satelliteEcf);

  return satellite.radiansToDegrees(lookAngles.elevation);
}

function calculateSigmoidScore(elevationDegrees: number): number {
  const midPointDegrees = PATHFINDING_DEFAULTS.SIGMOID_MIDPOINT_DEG;
  const steepness = PATHFINDING_DEFAULTS.SIGMOID_STEEPNESS; // תלילות העקומה (Steepness)

  const exponent = -steepness * (elevationDegrees - midPointDegrees);
  const signalQuality = 1 / (1 + Math.exp(exponent));

  return signalQuality;
}
export function calculateSatelliteScore(
  aircraftLat: number,
  aircraftLon: number,
  aircraftAltKm: number,
  satrec: satellite.SatRec,
  date: Date,
): number | null {
  const elevationAngle = calculateElevationAngle(
    aircraftLat,
    aircraftLon,
    aircraftAltKm,
    satrec,
    date,
  );

  if (elevationAngle === null) return null;

  return calculateSigmoidScore(elevationAngle);
}
