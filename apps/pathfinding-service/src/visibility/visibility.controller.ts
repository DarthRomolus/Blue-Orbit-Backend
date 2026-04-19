import { Controller, Logger } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { Payload, MessagePattern } from '@nestjs/microservices';
import { VisibilityRequestDto } from 'src/common/dto/visibility-request.dto';
import { VisibilityResponseDto } from 'src/common/dto/visibility-response.dto';
import { RMQ_PATTERNS } from 'src/common/constants/rmq.constants';
import { MissionClientService } from '../mission-client/mission-client.service';

@Controller('visibility')
export class VisibilityController {
  private readonly logger = new Logger(VisibilityController.name);

  constructor(
    private readonly visibilityService: VisibilityService,
    private readonly missionClientService: MissionClientService,
  ) {}

  @MessagePattern(RMQ_PATTERNS.CALCULATE_COVERAGE)
  async getCoverage(
    @Payload() visibilityRequest: VisibilityRequestDto,
  ): Promise<VisibilityResponseDto> {
    this.logger.log('Received calculation request from Gateway via RMQ');

    const result = await this.visibilityService.calculateMaxCoverageTimeWindow(
      new Date(visibilityRequest.startDate),
      new Date(visibilityRequest.endDate),
      visibilityRequest.locationCenter,
      visibilityRequest.locationRadiusKm,
      visibilityRequest.timeFrameHours,
    );

    const response: VisibilityResponseDto = {
      startTime: result.bestWindow.startTime?.toISOString() ?? null,
      coverageScore: result.bestWindow.coverageScore,
      coverageTimeline: result.coverageTimeline,
    };

    await this.missionClientService.sendMissionResult({
      Type: 'STATIC',
      startLat: visibilityRequest.locationCenter.latitude,
      startLon: visibilityRequest.locationCenter.longitude,
      startDate: visibilityRequest.startDate,
      endDate: visibilityRequest.endDate,
      radius: visibilityRequest.locationRadiusKm,
      result: response,
    });

    return response;
  }
}
