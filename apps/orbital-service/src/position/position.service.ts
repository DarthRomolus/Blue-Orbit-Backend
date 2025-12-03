import { Injectable } from '@nestjs/common';
import * as satellite from 'satellite.js';
import type { positionGdDto } from './DTO/positionGd.dto';
import { OrbitalService } from 'src/orbital/orbital.service';
import { SatelliteData } from '@generated/orbital-client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class PositionService {
  constructor(private readonly databaseService: DatabaseService) {}
  async calculatePosition(
    noradId: string,
    date: Date = new Date(),
  ): Promise<positionGdDto | null> {
    try {
      const satelliteTle: SatelliteData | null =
        await this.databaseService.getSatelliteById(noradId);
      if (!satelliteTle) {
        return null;
      }
      const tleLine1: string = satelliteTle.line1;
      const tleLine2: string = satelliteTle.line2;
      const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
      const positionAndVelocity = satellite.propagate(satrec, date);

      if (
        positionAndVelocity?.position &&
        typeof positionAndVelocity.position === 'object'
      ) {
        const positionEci =
          positionAndVelocity.position as satellite.EciVec3<number>;
        const gmst = satellite.gstime(date);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        /*const velocity = {
          x: positionAndVelocity.velocity.x,
          y: positionAndVelocity.velocity.y,
          z: positionAndVelocity.velocity.z,
        };*/

        const position = {
          longitude: satellite.degreesLong(positionGd.longitude),
          latitude: satellite.degreesLat(positionGd.latitude),
          height: positionGd.height * 1000,
        };

        return position;
      }
      return null;
    } catch (error) {
      return null;
    }
  }
}
