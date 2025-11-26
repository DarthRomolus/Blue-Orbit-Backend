import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { CelestrackService } from 'src/celestrack/celestrack.service';
import { SatelliteData } from '@generated/orbital-client';

@Injectable()
export class OrbitalService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly celestrackService: CelestrackService,
  ) {}

  async insertTleData(
    name: string,
    tleLine1: string,
    tleLine2: string,
    noradID,
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

  async getAllDataFromDB() {
    return await this.prismaService.satelliteData.findMany();
  }

  async processTleData(): Promise<SatelliteData[]> {
    const rawData = await this.celestrackService.getTleData('active');
    const lines = rawData.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i].trim();
      if (
        currentLine.startsWith('1 ') &&
        lines[i + 1]?.trim().startsWith('2 ')
      ) {
        const name = i > 0 ? lines[i - 1].trim() : 'Unknown';
        const line1 = lines[i].trim();
        const noradId = line1.substring(2, 7).trim();
        const line2 = lines[i + 1].trim();

        await this.insertTleData(name, line1, line2, noradId);
      }
    }

    return await this.getAllDataFromDB();
  }
}
