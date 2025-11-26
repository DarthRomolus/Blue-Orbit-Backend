import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrbitalModule } from './orbital/orbital.module';
import { CelestrackModule } from './celestrack/celestrack.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [OrbitalModule, CelestrackModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
