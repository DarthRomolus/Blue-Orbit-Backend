import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VisibilityModule } from './visibility/visibility.module';
import { PathfindingModule } from './pathfinding/pathfinding.module';
import { OrbitalClientModule } from './orbital-client/orbital-client.module';
import { MissionClientModule } from './mission-client/mission-client.module';

@Module({
  imports: [VisibilityModule, PathfindingModule, OrbitalClientModule, MissionClientModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
