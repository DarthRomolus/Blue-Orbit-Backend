import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { pathToGeoJSON } from 'src/common/utils/geo-calculations.utils';
import { PathfindingService } from './pathfinding.service';
import { PathfindingRequestDto } from 'src/common/dto/pathfinding-request.dto';

@Controller('pathfinding')
export class PathfindingController {
  private readonly logger = new Logger(PathfindingController.name);

  constructor(private readonly pathfindingService: PathfindingService) {}

  @MessagePattern({ cmd: 'calculate_path' })
  public async calculatePath(@Payload() pathfindingRequest: PathfindingRequestDto) {
    this.logger.log('Received calculation request from Gateway via RMQ');

    const startState = {
      ...pathfindingRequest.startState,
      time: new Date(pathfindingRequest.startState.time),
      costToPoint: 0,
      parentNode: null,
      signalQuality: 1.0,
    };

    const result = await this.pathfindingService.calculateOptimalPath(
      startState,
      pathfindingRequest.goal,
    );

    return {
      success: result.success,
      nodesExplored: result.nodesExplored,
      totalCost: result.totalCost,
      pathLength: result.path.length,
      geoJson: pathToGeoJSON(result.path),
    };
  }
}
