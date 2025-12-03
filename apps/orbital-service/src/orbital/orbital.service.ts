import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CelestrackService } from 'src/celestrack/celestrack.service';
import { SatelliteData } from '@generated/orbital-client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class OrbitalService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly celestrackService: CelestrackService,
  ) {}

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

        await this.databaseService.insertTleData(name, line1, line2, noradId);
      }
    }

    return await this.databaseService.getAllSatellites();
  }
}
