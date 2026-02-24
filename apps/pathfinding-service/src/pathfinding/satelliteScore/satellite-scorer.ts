import * as satellite from 'satellite.js';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';

/**
 * Calculates the elevation angle between the aircraft and the satellite.
 */
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

/**
 * Calculates the sigmoid score for the given elevation angle.
 */
function calculateSigmoidScore(elevationDegrees: number): number {
  const midPointDegrees = PATHFINDING_DEFAULTS.SIGMOID_MIDPOINT_DEG;
  const steepness = PATHFINDING_DEFAULTS.SIGMOID_STEEPNESS; 

  const exponent = -steepness * (elevationDegrees - midPointDegrees);
  const signalQuality = 1 / (1 + Math.exp(exponent));

  return signalQuality;
}

/**
 * Calculates the satellite score for the given aircraft position and satellite.
 * 
 * @param aircraftLat - The latitude of the aircraft.
 * @param aircraftLon - The longitude of the aircraft.
 * @param aircraftAltKm - The altitude of the aircraft in kilometers.
 * @param satrec - The satellite record.
 * @param date - The date and time.
 * @returns The satellite score.
 */
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
