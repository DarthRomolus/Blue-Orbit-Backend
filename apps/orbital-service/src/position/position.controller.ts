import { Controller, Get, Param } from '@nestjs/common';
import { PositionService } from './position.service';
import { MessagePattern } from '@nestjs/microservices';
import { Payload } from '@nestjs/microservices';

@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}
  @Get(':id')
  public calculateSatellitePosition(@Param('id') noradId: string) {
    return this.positionService.calculateSatellitePositionById(
      noradId,
      new Date(),
    );
  }
  @Get('path/:id') //dev
  public async test(@Param('id') noradId: string) {
    return await this.positionService.calculateSatellitePath(noradId);
  }
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
