import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { RMQ_CONSTANTS } from './common/constants/rmq.constants';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL!],
      queue: RMQ_CONSTANTS.ORBITAL_QUEUE,
      queueOptions: RMQ_CONSTANTS.QUEUE_OPTIONS,
    },
  });
  await app.startAllMicroservices();
  await app.listen(process.env.PORT!);
}
bootstrap();
