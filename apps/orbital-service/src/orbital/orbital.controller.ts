import { Controller, Post } from '@nestjs/common';
import { OrbitalService } from './orbital.service';
import { Get } from '@nestjs/common';
import type { SatelliteData } from 'src/common/types/satelliteData';
import { CELESTRACK_GROUPS } from 'src/common/constants/celestrak.constants';
import { MessagePattern } from '@nestjs/microservices';
import type { ReducedSatelliteData } from 'src/common/types/reducedSatelliteData';
import { RMQ_PATTERNS } from 'src/common/constants/rmq.constants';

@Controller('satellites')
export class OrbitalController {
  constructor(private readonly orbitalService: OrbitalService) {}

  @Post('process')
  public async getTLE(): Promise<SatelliteData[] | null> {
    await Promise.allSettled([
      //this.orbitalService.processTleData(CELESTRACK_GROUPS.GLOBALSTAR),
      this.orbitalService.processTleData(CELESTRACK_GROUPS.IRIDIUM),
      //this.orbitalService.processTleData(CELESTRACK_GROUPS.ONEWEB),
      this.orbitalService.processTleData(CELESTRACK_GROUPS.QIANFAN),
      //this.orbitalService.processTleData(CELESTRACK_GROUPS.ORBCOMM),
      //this.orbitalService.processTleData(CELESTRACK_GROUPS.KUIPER),

    ]);
    return this.orbitalService.allSatellitesData();
  }
  @MessagePattern(RMQ_PATTERNS.ALL_SATELLITE_DATA)
  public async getAllSatellitesForRMQ(): Promise<
    ReducedSatelliteData[] | null
  > {
    return await this.orbitalService.reducedSatelliteInfo();
  }

  @MessagePattern(RMQ_PATTERNS.FULL_SATELLITES)
  public async getAllSatellitesData(): Promise<SatelliteData[] | null> {
    return await this.orbitalService.allSatellitesData();
  }
}
