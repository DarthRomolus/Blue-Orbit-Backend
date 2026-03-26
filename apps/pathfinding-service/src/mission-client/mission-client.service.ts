import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { RMQ_PATTERNS } from '../common/constants/rmq.constants';

@Injectable()
export class MissionClientService implements OnModuleInit {
  private readonly logger = new Logger(MissionClientService.name);

  constructor(@Inject('MISSION_CLIENT') private readonly client: ClientProxy) {}

  async onModuleInit() {
    try {
      await this.client.connect();
      this.logger.log('Successfully connected to RabbitMQ (Mission Queue)');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ (Mission Queue):', error);
    }
  }

  async sendMissionResult(payload: any): Promise<void> {
    try {
      const pattern = RMQ_PATTERNS.SAVE_MISSION_RESULT;
      this.logger.log(`Sending save request to Mission Service for type: ${payload.Type}`);
      const payloadSize = JSON.stringify(payload).length;
      this.logger.log(`Payload stringified size: ${payloadSize} bytes`);
      
      const response = await lastValueFrom(this.client.send(pattern, payload));
      this.logger.log(`Successfully saved mission inside Mission Service. Returned ID: ${response?.id}`);
    } catch (error) {
      this.logger.error('Failed to send mission result to Mission Service:', error);
      if (error instanceof Error) {
        this.logger.error(`Error details: ${error.message}`, error.stack);
      }
    }
  }
}
