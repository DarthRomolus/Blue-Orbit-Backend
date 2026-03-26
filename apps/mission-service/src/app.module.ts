import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { DatabaseModule } from './database/database.module';
import { MissionModule } from './mission/mission.module';

@Module({
  imports: [PrismaModule, DatabaseModule, MissionModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
