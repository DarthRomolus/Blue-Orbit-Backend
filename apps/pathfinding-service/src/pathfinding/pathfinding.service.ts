import { Injectable } from '@nestjs/common';
import { SatelliteTle } from 'src/common/types/reducedSatelliteData';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import { astarEngine } from './astar/astar-engine';
import { State } from './graph/state';
import { Coordinates } from 'src/common/types/coordinates';

@Injectable()
export class PathfindingService {
  constructor(private readonly orbitalClientService: OrbitalClientService) {}
  private async fetchTleData(): Promise<SatelliteTle[]> {
    try {
      const reducedSatelliteData: SatelliteTle[] =
        await this.orbitalClientService.getReducedAllSatelliteInfo();
      return reducedSatelliteData;
    } catch (error) {
      throw error;
    }
  }
  async calculateOptimalPath(initialState: State, goal: Coordinates) {
    const satellitesData = await this.fetchTleData();
    return astarEngine(initialState, goal, satellitesData);
  }
}
