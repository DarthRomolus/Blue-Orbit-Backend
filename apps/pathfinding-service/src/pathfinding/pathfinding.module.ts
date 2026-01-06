import { Module } from '@nestjs/common';
import { PathfindingService } from './pathfinding.service';
import { PathfindingController } from './pathfinding.controller';

@Module({
  providers: [PathfindingService],
  controllers: [PathfindingController]
})
export class PathfindingModule {}
