import { Injectable } from '@nestjs/common';
import * as satellite from 'satellite.js';
import type { SatellitePositionGeodatic } from '../common/types/positionGeodetic.dto';
import { SatelliteData } from '@generated/orbital-client';
import { DatabaseService } from 'src/database/database.service';
import { TIME_RANGE } from 'src/common/constants/timeRange.constants';
import { MEASUREMENTS_DEFAULTS } from 'src/common/constants/measurements.constants';

@Injectable()
export class PositionService {
  constructor(private readonly databaseService: DatabaseService) {}

  async calculateSatellitePositionById(
    noradID: string,
    date: Date,
  ): Promise<SatellitePositionGeodatic | undefined> {
    try {
      const satelliteTle: SatelliteData | null =
        await this.databaseService.getSatelliteById(noradID);
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

  calculateSatellitePositionByData(
    satelliteData: SatelliteData,
    date: Date,
  ): SatellitePositionGeodatic | undefined {
    const tleLine1: string = satelliteData.line1;
    const tleLine2: string = satelliteData.line2;
    const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
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
      height: positionGd.height * MEASUREMENTS_DEFAULTS.KILOMETERS_TO_METERS,
    };
  }

  async calculateSatellitePath(
    noradId: string,
  ): Promise<SatellitePositionGeodatic[] | undefined> {
    const currentDate = new Date();
    const endDate = new Date(
      currentDate.getTime() +
        TIME_RANGE.MINUTES *
          TIME_RANGE.SECONDS_MULTIPLYER *
          TIME_RANGE.MILLISECONDS_MULTIPLYER,
    );

    const satelliteData: SatelliteData | null =
      await this.databaseService.getSatelliteById(noradId);
    if (!satelliteData) {
      return undefined;
    }
    let pathPoints: SatellitePositionGeodatic[] = [];
    while (currentDate <= endDate) {
      const position = this.calculateSatellitePositionByData(
        satelliteData,
        currentDate,
      );
      if (position) {
        pathPoints.push(position);
      }

      currentDate.setMinutes(currentDate.getMinutes() + 1);
    }
    return pathPoints;
  }
}
