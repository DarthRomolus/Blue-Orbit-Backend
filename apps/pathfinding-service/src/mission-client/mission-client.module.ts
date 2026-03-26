import { Module } from '@nestjs/common';
import { MissionClientService } from './mission-client.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RMQ_CONSTANTS } from '../common/constants/rmq.constants';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'MISSION_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: RMQ_CONSTANTS.MISSION_QUEUE,
          queueOptions: RMQ_CONSTANTS.QUEUE_OPTIONS,
        },
      },
    ]),
  ],
  providers: [MissionClientService],
  exports: [MissionClientService],
})
export class MissionClientModule {}
