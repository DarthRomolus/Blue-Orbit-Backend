import { Module } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { VisibilityController } from './visibility.controller';
import { OrbitalClientModule } from 'src/orbital-client/orbital-client.module';
import { MissionClientModule } from 'src/mission-client/mission-client.module';

@Module({
  imports: [OrbitalClientModule, MissionClientModule],
  providers: [VisibilityService],
  controllers: [VisibilityController],
})
export class VisibilityModule {}
