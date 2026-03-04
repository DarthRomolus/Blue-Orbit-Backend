import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import { Coordinates } from 'src/common/types/coordinates';
import { SatelliteTle } from 'src/common/types/reducedSatelliteData';
import { TimeWindowScore } from 'src/common/types/timeWindowScore';
import { TIME_DEFAULTS } from 'src/common/constants/time.constants';
import { VISIBILITY_DEFAULTS } from 'src/common/constants/visibility.constants';
import Piscina from 'piscina';
import { resolve } from 'path';

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

    const coarseEntries = await this.runCoarseScan(
      snappedStart,
      snappedEnd,
      locationCenter,
      locationRadiusKm,
      reducedSatelliteData
    );

    const coarseTimeFrameSlots = Math.floor(
      (timeFrameHours * TIME_DEFAULTS.HOURS_TO_MINUTES) / TIME_DEFAULTS.COARSE_STEP_MINUTES
    );

    const bestCoarseWindow = this.findBestSlidingWindow(coarseEntries, coarseTimeFrameSlots);

    if (!bestCoarseWindow.startTime) {
      return { startTime: null, coverageScore: 0 };
    }

    if (timeFrameHours > TIME_DEFAULTS.FINE_TUNING_THRESHOLD_HOURS) {
      this.logger.log('Large window requested. Skipping fine-tuning.');
      return bestCoarseWindow;
    }

    return this.runFineTuningScan(
      bestCoarseWindow.startTime,
      snappedStart,
      snappedEnd,
      timeFrameHours,
      locationCenter,
      locationRadiusKm,
      reducedSatelliteData
    );
  }

  private async runCoarseScan(
    snappedStart: Date,
    snappedEnd: Date,
    locationCenter: Coordinates,
    locationRadiusKm: number,
    reducedSatelliteData: SatelliteTle[]
  ): Promise<TimeWindowScore[]> {
    const batchDurationMs = Math.ceil(
      (snappedEnd.getTime() - snappedStart.getTime()) / this.numOfThreads
    );

    const promisesCoarse: Promise<Float64Array>[] = [];
    for (let i = 0; i < this.numOfThreads; i++) {
      const batchStartDate = new Date(snappedStart.getTime() + i * batchDurationMs);
      const batchEndDate = new Date(
        Math.min(snappedEnd.getTime(), batchStartDate.getTime() + batchDurationMs)
      );
      promisesCoarse.push(
        this.workerPool.run({
          startDate: batchStartDate,
          endDate: batchEndDate,
          locationCenter,
          locationRadiusKm,
          stepMinutes: TIME_DEFAULTS.COARSE_STEP_MINUTES,
          reducedSatelliteData,
        })
      );
    }
    
    const resultsCoarse = (await Promise.all(promisesCoarse)) as Float64Array[];
    const totalLengthCoarse = resultsCoarse.reduce((acc, curr) => acc + curr.length, 0);
    const mergedCoarseScores = new Float64Array(totalLengthCoarse);

    let offsetCoarse = 0;
    for (const batch of resultsCoarse) {
      mergedCoarseScores.set(batch, offsetCoarse);
      offsetCoarse += batch.length;
    }

    const coarseStepMs = TIME_DEFAULTS.COARSE_STEP_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;

    return Array.from(
      mergedCoarseScores,
      (coverageScore, i) => ({
        startTime: new Date(snappedStart.getTime() + i * coarseStepMs),
        coverageScore,
      })
    );
  }

  private async runFineTuningScan(
    bestCoarseStart: Date,
    snappedStart: Date,
    snappedEnd: Date,
    timeFrameHours: number,
    locationCenter: Coordinates,
    locationRadiusKm: number,
    reducedSatelliteData: SatelliteTle[]
  ): Promise<TimeWindowScore> {
    const paddingMs = TIME_DEFAULTS.PADDING_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;
    const timeFrameMs = timeFrameHours * TIME_DEFAULTS.MS_IN_HOUR;

    const fineStart = new Date(
      Math.max(bestCoarseStart.getTime() - paddingMs, snappedStart.getTime())
    );
    const fineEnd = new Date(
      Math.min(bestCoarseStart.getTime() + timeFrameMs + paddingMs, snappedEnd.getTime())
    );

    const fineStepMs = TIME_DEFAULTS.FINE_STEP_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;

    const fineScores = (await this.workerPool.run({
      startDate: fineStart,
      endDate: fineEnd,
      locationCenter,
      locationRadiusKm,
      stepMinutes: TIME_DEFAULTS.FINE_STEP_MINUTES,
      reducedSatelliteData,
    })) as Float64Array;

    const fineEntries = Array.from(fineScores, (coverageScore, i) => ({
      startTime: new Date(fineStart.getTime() + i * fineStepMs),
      coverageScore,
    }));

    const fineTimeFrameSlots = Math.floor(
      (timeFrameHours * TIME_DEFAULTS.HOURS_TO_MINUTES) / TIME_DEFAULTS.FINE_STEP_MINUTES
    );

    return this.findBestSlidingWindow(fineEntries, fineTimeFrameSlots);
  }

  private findBestSlidingWindow(entries: TimeWindowScore[], slots: number): TimeWindowScore {
    if (entries.length < slots) {
      return { startTime: null, coverageScore: 0 };
    }

    let windowSum = 0;
    for (let i = 0; i < slots; i++) {
      windowSum += entries[i].coverageScore;
    }

    let bestStart: Date | null = entries[0].startTime;
    let bestScore: number = windowSum;

    for (let i = 1; i <= entries.length - slots; i++) {//TODO: meaningfull variable name for i
      windowSum = windowSum - entries[i - 1].coverageScore + entries[i + slots - 1].coverageScore;

      if (windowSum > bestScore) {
        bestScore = windowSum;
        bestStart = entries[i].startTime;
      }
    }

    return {
      startTime: bestStart,
      coverageScore: bestScore,
    };
  }
}
