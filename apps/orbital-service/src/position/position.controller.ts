import { Controller } from '@nestjs/common';
import { PositionService } from './position.service';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';
import { RMQ_PATTERNS } from 'src/common/constants/rmq.constants';

@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}
  @MessagePattern(RMQ_PATTERNS.SATELLITE_POSITION)
  public calculatePositionForRMQ(@Payload() data: string) {
    const noradID = data;
    return this.positionService.calculateSatellitePositionById(
      noradID,
      new Date(),
    );
  }
  @MessagePattern(RMQ_PATTERNS.SATELLITE_PATH)
  public async calculateSatellitePath(@Payload() noradId: string) {
    return await this.positionService.calculateSatellitePath(noradId);
  }
}
