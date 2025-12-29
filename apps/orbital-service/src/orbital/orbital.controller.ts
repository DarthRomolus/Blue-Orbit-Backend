import { Controller, Post } from '@nestjs/common';
import { OrbitalService } from './orbital.service';
import { Get } from '@nestjs/common';
import { SatelliteData } from '@generated/orbital-client';
import { CELESTRACK_GROUPS } from 'src/common/constants/celestrak.constants';

@Controller('satellites')
export class OrbitalController {
  constructor(private readonly orbitalService: OrbitalService) {}

  @Post('process')
  async getTLE(): Promise<SatelliteData[]> {
    await this.orbitalService.processTleData(CELESTRACK_GROUPS.GLOBALSTAR);
    await this.orbitalService.processTleData(CELESTRACK_GROUPS.IRIDIUM);
    await this.orbitalService.processTleData(CELESTRACK_GROUPS.ONEWEB);
    return await this.orbitalService.processTleData(CELESTRACK_GROUPS.ORBCOMM);
  }
  @Get()
  async getAllSatellitesData(): Promise<SatelliteData[] | null> {
    return await this.orbitalService.allSatellitesData();
  }
}
