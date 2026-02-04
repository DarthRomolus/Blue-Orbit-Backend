import { Injectable } from '@nestjs/common';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import { SatellitePositionGeodetic } from 'src/common/types/satellite';
import { Coordinates } from 'src/common/types/coordinates';
import { ReducedSatelliteData } from 'src/common/types/reducedSatelliteData.dto';
import * as satellite from 'satellite.js';
import {
  calculateCoverageScore,
  calculateEffectiveRadius,
} from 'src/common/utils/geo-calculations.utils';
import { TimeWindowScore } from 'src/common/types/timeWindowScore';
import { TIME_DEFUALTS } from 'src/common/constants/time.constants';

@Injectable()
export class VisibilityService {
  constructor(private readonly orbitalClientService: OrbitalClientService) {}

  async calculateSatellitePositionById(
    noradID: string,
  ): Promise<SatellitePositionGeodetic> {
    const satellite: SatellitePositionGeodetic =
      await this.orbitalClientService.getSatellitePosition(noradID);
    return {
      longitude: satellite.longitude,
      latitude: satellite.latitude,
      height: satellite.height,
    };
  }
  // ------------------------------------------------------------------DEV
  async checkRMQ() {
    return await this.orbitalClientService.getReducedAllSatelliteInfo();
  }
  async calculateMaxCoverageTimeWindow(
    startDate: Date,
    endDate: Date,
    timeFrameHours: number,
    locationCenter: Coordinates,
    locationRadiusKm: number,
  ) {
    const reducedSatelliteInfo: ReducedSatelliteInfo[] =
      await this.orbitalClientService.getReducedAllSatelliteInfo();
  }
}
