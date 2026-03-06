import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PathfindingService } from './pathfinding.service';
import { PathfindingRequestDto } from 'src/common/dto/pathfinding-request.dto';
import { PathfindingResponseDto } from 'src/common/dto/pathfinding-response.dto';
import { RMQ_PATTERNS } from 'src/common/constants/rmq.constants';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';

@Controller('pathfinding')
export class PathfindingController {
  private readonly logger = new Logger(PathfindingController.name);

  constructor(private readonly pathfindingService: PathfindingService) {}

  @MessagePattern(RMQ_PATTERNS.CALCULATE_PATH)
  public async calculatePath(
    @Payload() pathfindingRequest: PathfindingRequestDto,
  ): Promise<PathfindingResponseDto> {
    this.logger.log('Received calculation request from Gateway via RMQ');

    const startState = {
      ...pathfindingRequest.startState,
      time: new Date(pathfindingRequest.startState.time),
      costToPoint: 0,
      parentNode: null,
      signalQuality: PATHFINDING_DEFAULTS.MAX_SIGNAL_QUALITY,
    };

    const result = await this.pathfindingService.calculateOptimalPath(
      startState,
      pathfindingRequest.goal,
    );
    const response: PathfindingResponseDto = {
      path: result.path,
      success: result.success,
      nodesExplored: result.nodesExplored,
      totalCost: result.totalCost,
      pathLength: result.path.length,
    };
    return response;
  }
}
