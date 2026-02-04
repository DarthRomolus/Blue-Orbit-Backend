import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type {
  SatelliteData,
  SatellitePositionGeodetic,
} from 'src/common/types/satellite';
import type { ReducedSatelliteData } from 'src/common/types/reducedSatelliteData.dto';

@Injectable()
export class OrbitalClientService implements OnModuleInit {
  constructor(@Inject('ORBITAL_CLIENT') private readonly client: ClientProxy) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      console.log('Successfully connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
    }
  }
  async getSatellitePosition(
    noradID: string,
  ): Promise<SatellitePositionGeodetic> {
    const pattern = { cmd: 'satellite-position' };
    const payload = noradID;
    const observable$ = this.client.send(pattern, payload);
    const satellite: SatellitePositionGeodetic =
      await lastValueFrom(observable$);
    return satellite;
  }
  async getReducedAllSatelliteInfo(): Promise<ReducedSatelliteData[]> {
    const pattern = { cmd: 'all-satellite-data' };
    const observable$ = this.client.send(pattern, {});
    const reducedAllSatelliteInfo: ReducedSatelliteData[] = await lastValueFrom(
      observable$,
      { defaultValue: null },
    );
    return reducedAllSatelliteInfo;
  }
}
