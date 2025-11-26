import { Controller } from '@nestjs/common';
import { OrbitalService } from './orbital.service';
import { Get } from '@nestjs/common';
import { Request } from 'express';
import { SatelliteData } from '@generated/orbital-client';

@Controller('satellites')
export class OrbitalController {
  constructor(private readonly orbitalService: OrbitalService) {}

  @Get()
  async getTLE(): Promise<SatelliteData[]> {
    return await this.orbitalService.processTleData();
  }
}
