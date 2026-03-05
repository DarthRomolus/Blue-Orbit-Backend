import { Controller, Logger } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { Payload, MessagePattern } from '@nestjs/microservices';
import { VisibilityRequestDto } from 'src/common/dto/visibility-request.dto';
import { RMQ_PATTERNS } from 'src/common/constants/rmq.constants';

@Controller('visibility')
export class VisibilityController {
  private readonly logger = new Logger(VisibilityController.name);

  constructor(private readonly visibilityService: VisibilityService) {}
  
  @MessagePattern(RMQ_PATTERNS.CALCULATE_COVERAGE)
  async getCoverage(@Payload() visibilityRequest: VisibilityRequestDto) {
    this.logger.log('Received calculation request from Gateway via RMQ');

    return this.visibilityService.calculateMaxCoverageTimeWindow(
      new Date(visibilityRequest.startDate),
      new Date(visibilityRequest.endDate),
      visibilityRequest.locationCenter,
      visibilityRequest.locationRadiusKm,
      visibilityRequest.timeFrameHours,
    );
  }
}
