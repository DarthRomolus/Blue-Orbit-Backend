import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@generated/mission-client';
import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const connectionString = process.env.MISSION_DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'MISSION_DATABASE_URL environment variable is not set. Cannot start the mission service without a database connection.',
      );
    }
    const pool = new Pool({ connectionString });

    const adapter = new PrismaPg(pool);

    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
