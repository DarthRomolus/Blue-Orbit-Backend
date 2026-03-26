import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { RMQ_CONSTANTS } from './common/constants/rmq.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
      queue: RMQ_CONSTANTS.MISSION_QUEUE,
      queueOptions: RMQ_CONSTANTS.QUEUE_OPTIONS,
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 3004); // Using a unique port 3004
}
bootstrap();
