import { Controller } from '@nestjs/common';
import { CelestrackService } from 'src/celestrack/celestrack.service';
import { Get } from '@nestjs/common';
import { Request } from 'express';

@Controller('satellites')
export class OrbitalController {
  constructor(private readonly celestrackService: CelestrackService) {}

  @Get()
  async getTLE(): Promise<string> {
    return await this.celestrackService.getTleData();
  }
}
