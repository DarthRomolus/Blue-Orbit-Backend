import { Injectable } from '@nestjs/common';
import { VISIBILITY_EQUATION_VARIABLES } from 'src/common/constants/equation.constants';
import * as satellite from 'satellite.js';
import { ANGLES_DEFAULTS } from 'src/common/constants/angles.constants';

@Injectable()
export class VisibilityService {
  calculateMaxRadius(satelliteAltitudeKm?: number): number {
    // DEV
    const heightKm = 550;
    const earthRadius = VISIBILITY_EQUATION_VARIABLES.EARTH_RADIUS_KM;

    const cosAngleForRadius = earthRadius / (earthRadius + heightKm);
    const angleForRadiusInRadians = Math.acos(cosAngleForRadius);
    const covrageRadiusKm = angleForRadiusInRadians * earthRadius;
    return covrageRadiusKm;
  }
  calculateEffectiveRadius(
    satelliteAltitudeKm: number = 1200,
    minElevationAngle: number = 25,
  ): number {
    // DEV
    const heightKm = satelliteAltitudeKm;
    const minElevationRad =
      minElevationAngle * ANGLES_DEFAULTS.DEGGREES_TO_RADIANS; //change to radians

    const earthRadius = VISIBILITY_EQUATION_VARIABLES.EARTH_RADIUS_KM;

    const cosAngleForRadius =
      (earthRadius / (earthRadius + heightKm)) * Math.cos(minElevationRad);
    const angleForRadiusInRadians =
      Math.acos(cosAngleForRadius) - minElevationRad;
    const covrageRadiusKm = angleForRadiusInRadians * earthRadius;
    return covrageRadiusKm;
  }
  calculateSatellitePosition(
    tle: { line1: string; line2: string },
    date = new Date(),
  ) {
    const satrec = satellite.twoline2satrec(tle.line1, tle.line2);
    const positionAndVelocity = satellite.propagate(satrec, date);

    if (
      !positionAndVelocity?.position ||
      typeof positionAndVelocity.position !== 'object'
    ) {
      return undefined;
    }

    const positionEci: satellite.EciVec3<number> = positionAndVelocity.position;
    const gmst = satellite.gstime(date);
    const positionGd = satellite.eciToGeodetic(positionEci, gmst);

    return {
      longitude: satellite.degreesLong(positionGd.longitude),
      latitude: satellite.degreesLat(positionGd.latitude),
      height: positionGd.height * 1000,
    };
  }
}
