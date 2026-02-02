import { Injectable } from '@nestjs/common';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import {
  SatelliteData,
  SatellitePositionGeodetic,
} from 'src/common/types/satellite';

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
}
