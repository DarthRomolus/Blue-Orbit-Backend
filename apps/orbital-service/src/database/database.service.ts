import { Injectable } from '@nestjs/common';
import { normalize } from 'node:path';
import { PrismaService } from 'src/prisma/prisma.service';
import type { reducedSatelliteInfo } from 'src/common/types/reducedSatelliteInfo.dto';
import type { SatelliteData } from 'src/common/types/satelliteData';
@Injectable()
export class DatabaseService {
  constructor(private readonly prismaService: PrismaService) {}
  async insertTleData(
    name: string,
    tleLine1: string,
    tleLine2: string,
    noradID: string,
  ) {
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
  }

  async getAllSatellites(): Promise<SatelliteData[] | null> {
    return await this.prismaService.satelliteData.findMany();
  }
  async getSatelliteById(noradId: string): Promise<SatelliteData | null> {
    return await this.prismaService.satelliteData.findUnique({
      where: { noradId },
    });
  }
  async getReducedAllSatelliteInfo(): Promise<reducedSatelliteInfo[] | null> {
    return await this.prismaService.satelliteData.findMany({
      select: {
        noradId: true,
        line1: true,
        line2: true,
      },
    });
  }
}
