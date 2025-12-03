import { Module } from '@nestjs/common';
import { PositionController } from './position.controller';
import { PositionService } from './position.service';
import { OrbitalModule } from 'src/orbital/orbital.module';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [OrbitalModule, DatabaseModule],
  controllers: [PositionController],
  providers: [PositionService],
})
export class PositionModule {}
