import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@generated/orbital-client';
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
    // 1. יצירת חיבור ל-Postgres (Pool)
    const connectionString = process.env.ORBITAL_DATABASE_URL;
    const pool = new Pool({ connectionString });

    // 2. יצירת המתאם של Prisma
    const adapter = new PrismaPg(pool);

    // 3. העברה ל-PrismaClient (זה התיקון לשגיאת __internal)
    super({ adapter });
  }
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
