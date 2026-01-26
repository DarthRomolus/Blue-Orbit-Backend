import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import type {
  SatelliteData,
  SatellitePositionGeodetic,
} from 'src/common/types/satellite';

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
  async getSatelliteInfo(noradID: string): Promise<SatellitePositionGeodetic> {
    const pattern = { info: 'satInfo' };
    const payload = noradID;
    const observable$ = this.client.send(pattern, payload);
    const satellite: SatellitePositionGeodetic =
      await lastValueFrom(observable$);
    return satellite;
  }
}
