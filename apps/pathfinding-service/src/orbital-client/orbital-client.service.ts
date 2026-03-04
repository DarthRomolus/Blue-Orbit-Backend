import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type { SatellitePositionGeodetic } from 'src/common/types/satellite';
import type { SatelliteTle } from 'src/common/types/reducedSatelliteData';

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
    const pattern = { cmd: 'satellite_position' };
    const payload = noradID;
    const observable$ = this.client.send(pattern, payload);
    const satellite: SatellitePositionGeodetic =
      await lastValueFrom(observable$);
    return satellite;
  }
  async getReducedAllSatelliteInfo(): Promise<SatelliteTle[]> {
    const pattern = { cmd: 'all_satellite_data' };
    const observable$ = this.client.send(pattern, {});
    const reducedAllSatelliteInfo: SatelliteTle[] = await lastValueFrom(
      observable$,
      { defaultValue: null },
    );
    return reducedAllSatelliteInfo;
  }

  async fetchTleData(): Promise<SatelliteTle[]> {
    const tleData = await this.getReducedAllSatelliteInfo();
    if (!tleData) {
      this.logger.warn('Received null TLE data from orbital service');
      return [];
    }
    return tleData;
  }
}
