import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrbitalModule } from './orbital/orbital.module';
import { CelestrackModule } from './celestrack/celestrack.module';

@Module({
  imports: [OrbitalModule, CelestrackModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
