import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { MissionService } from './mission.service';
import { RMQ_PATTERNS } from '../common/constants/rmq.constants';
import { MissionData } from '@generated/mission-client';

@Controller('mission')
export class MissionController {
  private readonly logger = new Logger(MissionController.name);

  constructor(private readonly missionService: MissionService) {}

  @MessagePattern(RMQ_PATTERNS.SAVE_MISSION_RESULT)
  async handleSaveMissionResult(@Payload() payload: any): Promise<MissionData> {
    this.logger.log(`Received RMQ message: SAVE_MISSION_RESULT for type: ${payload?.Type}`);
    try {
      const result = await this.missionService.saveMissionResult(payload);
      this.logger.log(`Successfully completed save protocol. ID produced: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Mission save protocol failed! Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  @MessagePattern(RMQ_PATTERNS.GET_ALL_MISSIONS)
  async handleGetAllMissions(): Promise<MissionData[]> {
    this.logger.log('Received get_all_missions request via RMQ');
    return this.missionService.getAllMissions();
  }

  @MessagePattern(RMQ_PATTERNS.GET_MISSION_BY_ID)
  async handleGetMissionById(@Payload() id: string): Promise<MissionData> {
    this.logger.log(`Received get_mission_by_id request for ID: ${id} via RMQ`);
    return this.missionService.getMissionById(id);
  }
}
