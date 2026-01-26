import { Injectable } from '@nestjs/common';
import { VISIBILITY_EQUATION_VARIABLES } from 'src/common/constants/equation.constants';
import * as satellite from 'satellite.js';
import { ANGLES_DEFAULTS } from 'src/common/constants/angles.constants';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import {
  SatelliteData,
  SatellitePositionGeodetic,
} from 'src/common/types/satellite';

@Injectable()
export class VisibilityService {
  constructor(private readonly orbitalClientService: OrbitalClientService) {}

  calculateEffectiveRadius(
    satelliteAltitudeKm: number = 1200,
    minElevationAngle: number = 60,
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
  async calculateSatellitePosition(
    noradID: string,
  ): Promise<SatellitePositionGeodetic> {
    const satellite: SatellitePositionGeodetic =
      await this.orbitalClientService.getSatelliteInfo(noradID);
    return {
      longitude: satellite.longitude,
      latitude: satellite.latitude,
      height: satellite.height,
    };
  }
}
