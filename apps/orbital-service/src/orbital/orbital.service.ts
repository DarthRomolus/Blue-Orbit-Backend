import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class OrbitalService {
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
}
