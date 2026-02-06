import { Module } from '@nestjs/common';
import { OrbitalClientService } from './orbital-client.service';
import { Client, ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'ORBITAL_CLIENT',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL ?? 'amqp://localhost:5672'],
          queue: 'orbital_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  providers: [OrbitalClientService],
  exports: [OrbitalClientService],
})
export class OrbitalClientModule {}
