import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type { SatellitePositionGeodetic } from 'src/common/types/satellite';
import type { SatelliteTle } from 'src/common/types/reducedSatelliteData';
import { RMQ_PATTERNS } from 'src/common/constants/rmq.constants';


@Injectable()
export class OrbitalClientService implements OnModuleInit {
  private readonly logger = new Logger(OrbitalClientService.name);

  constructor(@Inject('ORBITAL_CLIENT') private readonly client: ClientProxy) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to RabbitMQ');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ:', error);
    }
  }
  async getSatellitePosition(
    noradID: string,
  ): Promise<SatellitePositionGeodetic> {
    const pattern = RMQ_PATTERNS.SATELLITE_POSITION;
    const payload = noradID;
    const observable$ = this.client.send(pattern, payload);
    const satellite: SatellitePositionGeodetic =
      await lastValueFrom(observable$);
    return satellite;
  }
  async getReducedAllSatelliteInfo(): Promise<SatelliteTle[]> {
    const pattern = RMQ_PATTERNS.ALL_SATELLITE_DATA;
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
