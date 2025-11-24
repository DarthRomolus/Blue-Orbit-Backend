import { Module } from '@nestjs/common';
import { CelestrackService } from './celestrack.service';

@Module({
  providers: [CelestrackService],
  exports: [CelestrackService],
})
export class CelestrackModule {}
