import { Module } from '@nestjs/common';
import { OrbitalController } from './orbital.controller';
import { OrbitalService } from './orbital.service';
import { CelestrackModule } from 'src/celestrack/celestrack.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [CelestrackModule],
  controllers: [OrbitalController],
  providers: [OrbitalController, PrismaService],
})
export class OrbitalModule {}
