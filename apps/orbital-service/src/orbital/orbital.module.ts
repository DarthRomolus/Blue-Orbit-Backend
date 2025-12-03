import { Module } from '@nestjs/common';
import { OrbitalController } from './orbital.controller';
import { OrbitalService } from './orbital.service';
import { CelestrackModule } from 'src/celestrack/celestrack.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [CelestrackModule, DatabaseModule],
  controllers: [OrbitalController],
  providers: [OrbitalService, PrismaService],
  exports: [OrbitalService],
})
export class OrbitalModule {}
