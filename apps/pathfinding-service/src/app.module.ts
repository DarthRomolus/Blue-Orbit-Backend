import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VisibilityModule } from './visibility/visibility.module';
import { PathfindingModule } from './pathfinding/pathfinding.module';

@Module({
  imports: [VisibilityModule, PathfindingModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
