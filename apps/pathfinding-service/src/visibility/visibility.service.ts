import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import { Coordinates } from 'src/common/types/coordinates';
import { SatelliteTle } from 'src/common/types/reducedSatelliteData';
import { TimeWindowScore } from 'src/common/types/timeWindowScore';
import { TIME_DEFAULTS } from 'src/common/constants/time.constants';
import { VISIBILITY_DEFAULTS } from 'src/common/constants/visibility.constants';
import Piscina from 'piscina';
import { resolve } from 'path';
import { findBestSlidingWindow } from './slidingWindow/slidingWindow';
import { runCoarseScan } from './coverageScan/coarseScan';
import { runFineTuningScan } from './coverageScan/fineScan';

@Injectable()
export class VisibilityService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VisibilityService.name);
  private workerPool: Piscina;
  private readonly numOfThreads = VISIBILITY_DEFAULTS.WORKER_POOL_THREAD_COUNT;
  
  constructor(private readonly orbitalClientService: OrbitalClientService) {}

  onModuleInit() {
    this.workerPool = new Piscina({
      filename: resolve(__dirname, VISIBILITY_DEFAULTS.COVERAGE_WORKER_FILENAME),
      maxThreads: this.numOfThreads,
    });
  }
  async onModuleDestroy() {
    try {
      await this.workerPool.destroy();
    } catch (error) {
      this.logger.error('Failed to destroy worker pool:', error);
    }
  }

  async calculateMaxCoverageTimeWindow(
    startDate: Date,
    endDate: Date,
    locationCenter: Coordinates,
    locationRadiusKm: number,
    timeFrameHours: number,
  ): Promise<TimeWindowScore> {
    const stepMs = TIME_DEFAULTS.FINE_STEP_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;
    const snappedStart = new Date(Math.ceil(startDate.getTime() / stepMs) * stepMs);
    const snappedEnd = new Date(Math.floor(endDate.getTime() / stepMs) * stepMs);

    const reducedSatelliteData: SatelliteTle[] = await this.orbitalClientService.fetchTleData();

    const coarseEntries = await runCoarseScan(
      this.workerPool,
      snappedStart,
      snappedEnd,
      locationCenter,
      locationRadiusKm,
      reducedSatelliteData
    );

    const coarseTimeFrameSlots = Math.floor(
      (timeFrameHours * TIME_DEFAULTS.HOURS_TO_MINUTES) / TIME_DEFAULTS.COARSE_STEP_MINUTES
    );

    const bestCoarseWindow = findBestSlidingWindow(coarseEntries, coarseTimeFrameSlots);

    if (!bestCoarseWindow.startTime) {
      return { startTime: null, coverageScore: 0 };
    }

    if (timeFrameHours > TIME_DEFAULTS.FINE_TUNING_THRESHOLD_HOURS) {
      this.logger.log('Large window requested. Skipping fine-tuning.');
      return bestCoarseWindow;
    }

    return runFineTuningScan(
      this.workerPool,
      bestCoarseWindow.startTime,
      snappedStart,
      snappedEnd,
      timeFrameHours,
      locationCenter,
      locationRadiusKm,
      reducedSatelliteData
    );
  }

}
