import { Controller, Get, Param } from '@nestjs/common';
import { PositionService } from './position.service';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';

@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}
  @MessagePattern({ cmd: 'satellite_position' })
  public calculatePositionForRMQ(@Payload() data: string) {
    const noradID = data;
    return this.positionService.calculateSatellitePositionById(
      noradID,
      new Date(),
    );
  }
  @MessagePattern({ cmd: 'get_satellite_path' })
  public async calculateSatellitePath(@Payload() noradId: string) {
    return await this.positionService.calculateSatellitePath(noradId);
  }
}
