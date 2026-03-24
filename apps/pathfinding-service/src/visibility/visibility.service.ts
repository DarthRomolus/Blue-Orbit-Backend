import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import { Coordinates } from 'src/common/types/coordinates';
import { SatelliteTle } from 'src/common/types/reducedSatelliteData';
import { TimeWindowScore } from 'src/common/types/timeWindowScore';
import {
  VisibilityResult,
  CoverageTimelinePoint,
} from 'src/common/types/visibility.types';
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
  ): Promise<VisibilityResult> {
    const stepMs = TIME_DEFAULTS.FINE_STEP_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;
    const snappedStart = new Date(
      Math.ceil(startDate.getTime() / stepMs) * stepMs,
    );
    const snappedEnd = new Date(
      Math.floor(endDate.getTime() / stepMs) * stepMs,
    );

    const reducedSatelliteData: SatelliteTle[] =
      await this.orbitalClientService.fetchTleData();

    const coarseEntries = await runCoarseScan(
      this.workerPool,
      snappedStart,
      snappedEnd,
      locationCenter,
      locationRadiusKm,
      reducedSatelliteData,
    );

    const coarseTimeFrameSlots = Math.floor(
      (timeFrameHours * TIME_DEFAULTS.HOURS_TO_MINUTES) /
        TIME_DEFAULTS.COARSE_STEP_MINUTES,
    );

    const bestCoarseWindow = findBestSlidingWindow(
      coarseEntries,
      coarseTimeFrameSlots,
    );

    if (!bestCoarseWindow.startTime) {
      return {
        bestWindow: { startTime: null, coverageScore: 0 },
        coverageTimeline: [],
      };
    }

    let bestWindow: TimeWindowScore;

    if (timeFrameHours > TIME_DEFAULTS.FINE_TUNING_THRESHOLD_HOURS) {
      this.logger.log('Large window requested. Skipping fine-tuning.');
      bestWindow = bestCoarseWindow;
    } else {
      bestWindow = await runFineTuningScan(
        this.workerPool,
        bestCoarseWindow.startTime,
        snappedStart,
        snappedEnd,
        timeFrameHours,
        locationCenter,
        locationRadiusKm,
        reducedSatelliteData,
      );
    }

    const windowStartMs = bestWindow.startTime!.getTime();
    const windowEndMs =
      windowStartMs + timeFrameHours * TIME_DEFAULTS.MS_IN_HOUR;

    const windowScores = (await this.workerPool.run({
      startDate: new Date(windowStartMs),
      endDate: new Date(windowEndMs),
      locationCenter,
      locationRadiusKm,
      stepMinutes: TIME_DEFAULTS.FINE_STEP_MINUTES,
      reducedSatelliteData,
    })) as Float64Array;

    const fineStepMs =
      TIME_DEFAULTS.FINE_STEP_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;
    const maxScore = Math.max(...windowScores);
    const coverageTimeline: CoverageTimelinePoint[] = Array.from(
      windowScores,
      (coverageScore, i) => ({
        timestamp: new Date(windowStartMs + i * fineStepMs).toISOString(),
        coverageScore: maxScore > 0 ? coverageScore / maxScore : 0,
      }),
    );

    return { bestWindow, coverageTimeline };
  }
}
