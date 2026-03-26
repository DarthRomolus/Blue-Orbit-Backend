import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MissionData, Prisma } from '@generated/mission-client';

@Injectable()
export class MissionService {
  private readonly logger = new Logger(MissionService.name);

  constructor(private readonly databaseService: DatabaseService) {}

  async saveMissionResult(payload: any): Promise<MissionData> {
    this.logger.log(`Saving mission result of type: ${payload.Type}`);

    const Type = payload.Type;
    const startLat = payload.startLat;
    const startLon = payload.startLon;
    const endLat = payload.endLat ?? null;
    const endLon = payload.endLon ?? null;
    const startDate = new Date(payload.startDate);
    const endDate = payload.endDate ? new Date(payload.endDate) : null;
    const radius = payload.radius ?? null;

    // Check if an exact identical mission already exists in the database
    const existingMission = await this.databaseService.findMissionByParams(
      Type,
      startLat,
      startLon,
      endLat,
      endLon,
      startDate,
      endDate,
      radius,
    );

    if (existingMission) {
      this.logger.log(`Aborting Prisma Create: Mission calculation is identical to existing DB row.`);
      return existingMission;
    }

    const missionData: Prisma.MissionDataUncheckedCreateInput = {
      Type,
      startLat,
      startLon,
      endLat,
      endLon,
      startDate,
      endDate,
      radius,
      result: payload.result,
    };

    return this.databaseService.insertMissionData(missionData);
  }

  async getAllMissions(): Promise<MissionData[]> {
    return this.databaseService.getAllMissions();
  }

  async getMissionById(id: string): Promise<MissionData> {
    return this.databaseService.getMissionById(id);
  }
}
