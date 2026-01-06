import { Module } from '@nestjs/common';
import { VisibilityService } from './visibility.service';
import { VisibilityController } from './visibility.controller';

@Module({
  providers: [VisibilityService],
  controllers: [VisibilityController]
})
export class VisibilityModule {}
