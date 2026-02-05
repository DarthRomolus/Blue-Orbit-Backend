import { Controller, Post } from '@nestjs/common';
import { OrbitalService } from './orbital.service';
import { Get } from '@nestjs/common';
import type { SatelliteData } from 'src/common/types/satelliteData';
import { CELESTRACK_GROUPS } from 'src/common/constants/celestrak.constants';
import { MessagePattern } from '@nestjs/microservices';
import type { ReducedSatelliteData } from 'src/common/types/reducedSatelliteData.dto';

@Controller('satellites')
export class OrbitalController {
  constructor(private readonly orbitalService: OrbitalService) {}

  @Post('process')
  public async getTLE(): Promise<SatelliteData[] | null> {
    await Promise.all([
      this.orbitalService.processTleData(CELESTRACK_GROUPS.GLOBALSTAR),
      this.orbitalService.processTleData(CELESTRACK_GROUPS.IRIDIUM),
      this.orbitalService.processTleData(CELESTRACK_GROUPS.ONEWEB),
      this.orbitalService.processTleData(CELESTRACK_GROUPS.QIANFAN),
      this.orbitalService.processTleData(CELESTRACK_GROUPS.ORBCOMM),
    ]);
    return this.orbitalService.allSatellitesData();
  }
  @Get()
  public async getAllSatellitesData(): Promise<SatelliteData[] | null> {
    return await this.orbitalService.allSatellitesData();
  }
  @MessagePattern({ cmd: 'all-satellite-data' })
  public async getAllSatellitesForRMQ(): Promise<
    ReducedSatelliteData[] | null
  > {
    return await this.orbitalService.reducedSatelliteInfo();
  }
}
