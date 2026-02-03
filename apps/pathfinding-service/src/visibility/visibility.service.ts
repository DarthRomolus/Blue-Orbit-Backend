import { Injectable } from '@nestjs/common';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import {
  SatelliteData,
  SatellitePositionGeodetic,
} from 'src/common/types/satellite';
import { Coordinates } from 'src/common/types/coordinates';
import { ReducedSatelliteInfo } from 'src/common/types/reducedSatelliteInfo.dto';

@Injectable()
export class VisibilityService {
  constructor(private readonly orbitalClientService: OrbitalClientService) {}

  async calculateSatellitePosition(
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
