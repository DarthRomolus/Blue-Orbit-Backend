import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class DatabaseService {
  constructor(private readonly prismaService: PrismaService) {}
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

  async getAllSatellites() {
    return await this.prismaService.satelliteData.findMany();
  }
  async getSatelliteById(noradId: string) {
    return await this.prismaService.satelliteData.findUnique({
      where: { noradId },
    });
  }
}
