import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SatelliteModule } from './satellite/satellite.module';

@Module({
  imports: [SatelliteModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
