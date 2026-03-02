import { Controller, Get } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { Payload, MessagePattern } from '@nestjs/microservices';
import { VisibilityRequestDto } from 'src/common/dto/visibility-request.dto';

@Controller('visibility')
export class VisibilityController {
  constructor(private readonly visibilityService: VisibilityService) {}
  @MessagePattern({ cmd: 'calculate_coverage' })
  async getCoverage(@Payload() visibilityRequest: VisibilityRequestDto) {
    console.log('Received calculation request from Gateway via RMQ');

    // קריאה לפונקציה האמיתית עם המרת התאריכים (מחרוזת לאובייקט Date)
    return this.visibilityService.calculateMaxCoverageTimeWindowOptimized(
      new Date(visibilityRequest.startDate),
      new Date(visibilityRequest.endDate),
      visibilityRequest.locationCenter,
      visibilityRequest.locationRadiusKm,
      visibilityRequest.timeFrameHours,
    );
  }
}
