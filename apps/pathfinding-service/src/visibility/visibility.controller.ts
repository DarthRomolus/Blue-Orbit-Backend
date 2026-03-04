import { Controller, Logger } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { Payload, MessagePattern } from '@nestjs/microservices';
import { VisibilityRequestDto } from 'src/common/dto/visibility-request.dto';

@Controller('visibility')
export class VisibilityController {
  private readonly logger = new Logger(VisibilityController.name);

  constructor(private readonly visibilityService: VisibilityService) {}
  @MessagePattern({ cmd: 'calculate_coverage' })
  async getCoverage(@Payload() visibilityRequest: VisibilityRequestDto) {
    this.logger.log('Received calculation request from Gateway via RMQ');

    // Call the coverage calculation with date conversion (string to Date object)
    return this.visibilityService.calculateMaxCoverageTimeWindowOptimized(
      new Date(visibilityRequest.startDate),
      new Date(visibilityRequest.endDate),
      visibilityRequest.locationCenter,
      visibilityRequest.locationRadiusKm,
      visibilityRequest.timeFrameHours,
    );
  }
}
