import { Injectable } from '@nestjs/common';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import { astarEngine } from './astar/astar-engine';
import { State } from './graph/state';
import { Coordinates } from 'src/common/types/coordinates';

@Injectable()
export class PathfindingService {
  constructor(private readonly orbitalClientService: OrbitalClientService) {}

  async calculateOptimalPath(initialState: State, goal: Coordinates) {
    const satellitesData = await this.orbitalClientService.fetchTleData();
    return astarEngine(initialState, goal, satellitesData);
  }
}
