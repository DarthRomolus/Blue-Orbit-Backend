import { Injectable,Logger } from '@nestjs/common';
import * as satellite from 'satellite.js';
import type { SatellitePositionGeodetic } from '../common/types/positionGeodetic';
import type { SatelliteData } from 'src/common/types/satelliteData';
import { DatabaseService } from 'src/database/database.service';
import { TIME_RANGE } from 'src/common/constants/timeRange.constants';
import { MEASUREMENTS_DEFAULTS } from 'src/common/constants/measurements.constants';

@Injectable()
export class PositionService {
  private readonly logger = new Logger(PositionService.name);
  constructor(private readonly databaseService: DatabaseService) {}

  async calculateSatellitePositionById(
    noradID: string,
    date: Date,
  ): Promise<SatellitePositionGeodetic | undefined> {
    try {
      const satelliteTle: SatelliteData | null =
        await this.databaseService.getSatelliteById(noradID);
      if (!satelliteTle) {
        return undefined;
      }
      return this.calculateSatellitePositionByData(satelliteTle, date);
    } catch (error) {
      this.logger.error(`Failed to calculate position for NORAD ID ${noradID}: ${error}`);
      return undefined;
    }
  }

  calculateSatellitePositionByData(
    satelliteData: SatelliteData,
    date: Date,
  ): SatellitePositionGeodetic | undefined {
    try {
      const satrec = satellite.twoline2satrec(satelliteData.line1, satelliteData.line2);
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
    } catch (error) {
      this.logger.warn(`Failed to calculate position for satellite ${satelliteData.noradId}: ${error}`);
      return undefined;
    }
  }

  async calculateSatellitePath(
    noradId: string,
  ): Promise<SatellitePositionGeodetic[] | undefined> {
    const currentDate = new Date();
    const endDate = new Date(
      currentDate.getTime() + TIME_RANGE.PATH_DURATION_MS,
    );

    const satelliteData: SatelliteData | null =
      await this.databaseService.getSatelliteById(noradId);
    if (!satelliteData) {
      this.logger.error(`Satellite with NORAD ID ${noradId} not found`);
      return undefined;
    }
    const pathPoints: SatellitePositionGeodetic[] = [];
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
