import { Module } from '@nestjs/common';
import { OrbitalController } from './orbital.controller';
import { OrbitalService } from './orbital.service';
import { CelestrackModule } from 'src/celestrack/celestrack.module';

@Module({
  imports: [CelestrackModule],
  controllers: [OrbitalController],
  providers: [OrbitalController],
})
export class OrbitalModule {}
