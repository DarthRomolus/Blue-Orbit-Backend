import { Module } from '@nestjs/common';
import { PathfindingService } from './pathfinding.service';
import { PathfindingController } from './pathfinding.controller';
import { OrbitalClientModule } from 'src/orbital-client/orbital-client.module';

@Module({
  imports: [OrbitalClientModule],
  providers: [PathfindingService],
  controllers: [PathfindingController],
})
export class PathfindingModule {}
