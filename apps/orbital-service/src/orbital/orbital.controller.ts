import { Controller } from '@nestjs/common';
import { CelestrackService } from 'src/celestrack/celestrack.service';
import { Get } from '@nestjs/common';

@Controller('satellite')
export class OrbitalController {
  constructor(private readonly celestrackService: CelestrackService) {}

  @Get()
  async getTLE(): Promise<string> {
    return await this.celestrackService.getTleData();
  }
}
