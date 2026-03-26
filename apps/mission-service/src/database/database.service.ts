import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MissionData, MissionType, Prisma } from '@generated/mission-client';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private readonly prismaService: PrismaService) {}

  async insertMissionData(
    data: Prisma.MissionDataUncheckedCreateInput,
  ): Promise<MissionData> {
    this.logger.log(`Attempting to write mission into Prisma Database: ${data.Type}`);
    try {
      const result = await this.prismaService.missionData.create({
        data,
      });
      this.logger.log(`Prisma successfully created row with ID: ${result.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Prisma CREATE failed with error: ${(error as Error).message}`, (error as Error).stack);
      throw new InternalServerErrorException(
        `Failed to save mission data. Error: ${(error as Error).message}`,
      );
    }
  }

  async findMissionByParams(
    Type: MissionType,
    startLat: number,
    startLon: number,
    endLat: number | null,
    endLon: number | null,
    startDate: Date,
    endDate: Date | null,
    radius: number | null,
  ): Promise<MissionData | null> {
    this.logger.log(`Checking DB for existing duplicate ${Type} mission...`);
    try {
      const existing = await this.prismaService.missionData.findFirst({
        where: {
          Type,
          startLat,
          startLon,
          endLat,
          endLon,
          startDate,
          endDate,
          radius,
        },
      });
      if (existing) {
        this.logger.log(`Found exact match! Duplicate prevented. Returning existing ID: ${existing.id}`);
      } else {
        this.logger.log(`No exact match found. Proceeding with new row generation.`);
      }
      return existing;
    } catch (error) {
      this.logger.error(`Prisma findFirst failed: ${(error as Error).message}`, (error as Error).stack);
      return null;
    }
  }

  async getAllMissions(): Promise<MissionData[]> {
    try {
      return await this.prismaService.missionData.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch missions');
    }
  }

  async getMissionById(id: string): Promise<MissionData> {
    try {
      const mission = await this.prismaService.missionData.findUnique({
        where: { id },
      });

      if (!mission) {
        throw new NotFoundException(`Mission with ID ${id} not found`);
      }

      return mission;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch mission with ID ${id}`,
      );
    }
  }
}

