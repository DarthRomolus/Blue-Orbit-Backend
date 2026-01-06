import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrbitalModule } from './orbital/orbital.module';
import { CelestrackModule } from './celestrack/celestrack.module';
import { PrismaModule } from './prisma/prisma.module';
import { PositionModule } from './position/position.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [OrbitalModule, CelestrackModule, PrismaModule, PositionModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
