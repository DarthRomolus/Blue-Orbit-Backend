import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { ReducedSatelliteData } from 'src/common/types/reducedSatelliteData.dto';
import type { SatelliteData } from 'src/common/types/satelliteData';

@Injectable()
export class DatabaseService {
  constructor(private readonly prismaService: PrismaService) {}

  async insertTleData(
    name: string,
    tleLine1: string,
    tleLine2: string,
    noradID: string,
  ): Promise<void> {
    try {
      await this.prismaService.satelliteData.upsert({
        where: { noradId: noradID },
        update: { line1: tleLine1, line2: tleLine2 },
        create: {
          noradId: noradID,
          name: name,
          line1: tleLine1,
          line2: tleLine2,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Failed to save satellite data for NORAD ID ${noradID}`,
      );
    }
  }

  async getAllSatellites(): Promise<SatelliteData[]> {
    try {
      return await this.prismaService.satelliteData.findMany();
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch satellites');
    }
  }

  async getSatelliteById(noradId: string): Promise<SatelliteData> {
    try {
      const satellite = await this.prismaService.satelliteData.findUnique({
        where: { noradId },
      });

      if (!satellite) {
        throw new NotFoundException(
          `Satellite with NORAD ID ${noradId} not found`,
        );
      }

      return satellite;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to fetch satellite with NORAD ID ${noradId}`,
      );
    }
  }

  async getReducedAllSatelliteInfo(): Promise<ReducedSatelliteData[]> {
    try {
      return await this.prismaService.satelliteData.findMany({
        select: {
          noradId: true,
          line1: true,
          line2: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch reduced satellite info',
      );
    }
  }
}
