import { Module } from '@nestjs/common';
import { OrbitalClientService } from './orbital-client.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQ_CONSTANTS } from '../common/constants/rmq.constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORBITAL_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL!],
          queue: RMQ_CONSTANTS.ORBITAL_QUEUE,
          queueOptions: RMQ_CONSTANTS.QUEUE_OPTIONS,
        },
      },
    ]),
  ],
  providers: [OrbitalClientService],
  exports: [OrbitalClientService],
})
export class OrbitalClientModule {}
