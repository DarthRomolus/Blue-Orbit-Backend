import { Controller } from '@nestjs/common';
import { OrbitalService } from './orbital.service';
import { Get } from '@nestjs/common';
import { SatelliteData } from '@generated/orbital-client';

@Controller('satellites')
export class OrbitalController {
  constructor(private readonly orbitalService: OrbitalService) {}

  @Get('process')
  async getTLE(): Promise<SatelliteData[]> {
    //dev endpoint
    return await this.orbitalService.processTleData();
  }
  @Get()
  async getAllSatellitesData(): Promise<SatelliteData[] | null> {
    return await this.orbitalService.allSatellitesData();
  }
}
