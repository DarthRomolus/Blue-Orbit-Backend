import { Injectable } from '@nestjs/common';
import * as satellite from 'satellite.js';
import type { PositionGeodatic } from './DTO/positionGeodetic.dto';
import { OrbitalService } from 'src/orbital/orbital.service';
import { SatelliteData } from '@generated/orbital-client';
import { DatabaseService } from 'src/database/database.service';

import { MEASUREMENTS_DEFAULTS } from 'src/common/constants/measurements.constants';

@Injectable()
export class PositionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async calculateSatellitePosition(
    noradId: string,
    date: Date = new Date(),
  ): Promise<positionGdDto | undefined> {
    try {
      const satelliteTle: SatelliteData | null =
        await this.databaseService.getSatelliteById(noradId);
      if (!satelliteTle) {
        return undefined;
      }
      const tleLine1: string = satelliteTle.line1;
      const tleLine2: string = satelliteTle.line2;
      const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
      const positionAndVelocity = satellite.propagate(satrec, date);

      if (
        !positionAndVelocity?.position ||
        typeof positionAndVelocity.position !== 'object'
      ) {
        return undefined;
      }
      const positionEci: satellite.EciVec3<number> =
        positionAndVelocity.position;
      const gmst = satellite.gstime(date);
      const positionGd = satellite.eciToGeodetic(positionEci, gmst);

      return {
        longitude: satellite.degreesLong(positionGd.longitude),
        latitude: satellite.degreesLat(positionGd.latitude),
        height: positionGd.height * MEASUREMENTS_DEFAULTS.KILOMETERS_TO_METERS,
      };
    } catch (error) {
      return undefined;
    }
  }
}
