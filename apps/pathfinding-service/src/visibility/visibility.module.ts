import { Module } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { VisibilityController } from './visibility.controller';
import { OrbitalClientModule } from 'src/orbital-client/orbital-client.module';

@Module({
  imports: [OrbitalClientModule],
  providers: [VisibilityService],
  controllers: [VisibilityController],
})
export class VisibilityModule {}
