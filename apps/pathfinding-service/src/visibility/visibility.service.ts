import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import { Coordinates } from 'src/common/types/coordinates';
import { ReducedSatelliteData } from 'src/common/types/reducedSatelliteData';
import { TimeWindowScore } from 'src/common/types/timeWindowScore';
import { TIME_DEFAULTS } from 'src/common/constants/time.constants';
import Piscina from 'piscina';
import { resolve } from 'path';
import os from 'os';

@Injectable()
export class VisibilityService implements OnModuleInit, OnModuleDestroy {
  private workerPool: Piscina;
  private readonly numOfThreads = 6; //dev
  constructor(private readonly orbitalClientService: OrbitalClientService) {}

  onModuleInit() {
    this.workerPool = new Piscina({
      filename: resolve(__dirname, 'workers/coverage.worker.js'),
      maxThreads: this.numOfThreads,
    });
  }
  onModuleDestroy() {
    this.workerPool.destroy();
  }
  private async fetchTleData(): Promise<ReducedSatelliteData[]> {
    try {
      const reducedSatelliteData: ReducedSatelliteData[] =
        await this.orbitalClientService.getReducedAllSatelliteInfo();
      return reducedSatelliteData;
    } catch (error) {
      throw error;
    }
  }

  async calculateMaxCoverageTimeWindowOptimized(
    startDate: Date,
    endDate: Date,
    locationCenter: Coordinates,
    locationRadiusKm: number,
    timeFrameHours: number,
  ): Promise<TimeWindowScore> {
    const stepMs = TIME_DEFAULTS.FINE_STEP_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;
    const snappedStart = new Date(
      Math.ceil(startDate.getTime() / stepMs) * stepMs,
    );
    const snappedEnd = new Date(
      Math.floor(endDate.getTime() / stepMs) * stepMs,
    );

    const reducedSatelliteData: ReducedSatelliteData[] =
      await this.fetchTleData();

    const coarseStepMs =
      TIME_DEFAULTS.COARSE_STEP_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;

    const coarseScores = (await this.workerPool.run({
      startDate: snappedStart,
      endDate: snappedEnd,
      locationCenter,
      locationRadiusKm,
      stepMinutes: TIME_DEFAULTS.COARSE_STEP_MINUTES,
      reducedSatelliteData, // שולחים את המידע הגולמי
    })) as Float64Array;

    const coarseEntries: TimeWindowScore[] = Array.from(
      coarseScores,
      (coverageScore, i) => ({
        startTime: new Date(snappedStart.getTime() + i * coarseStepMs),
        coverageScore,
      }),
    );

    const coarseTimeFrameSlots = Math.floor(
      (timeFrameHours * TIME_DEFAULTS.HOURS_TO_MINUTES) /
        TIME_DEFAULTS.COARSE_STEP_MINUTES,
    );

    if (coarseEntries.length < coarseTimeFrameSlots) {
      return { startTime: null, coverageScore: 0 };
    }

    let coarseWindowSum = 0;
    for (let i = 0; i < coarseTimeFrameSlots; i++) {
      coarseWindowSum += coarseEntries[i].coverageScore;
    }

    let bestCoarseStart: Date | null = coarseEntries[0].startTime;
    let bestCoarseScore: number = coarseWindowSum;

    for (let i = 1; i <= coarseEntries.length - coarseTimeFrameSlots; i++) {
      coarseWindowSum =
        coarseWindowSum -
        coarseEntries[i - 1].coverageScore +
        coarseEntries[i + coarseTimeFrameSlots - 1].coverageScore;

      if (coarseWindowSum > bestCoarseScore) {
        bestCoarseScore = coarseWindowSum;
        bestCoarseStart = coarseEntries[i].startTime;
      }
    }

    if (!bestCoarseStart) {
      return { startTime: null, coverageScore: 0 };
    }
    if (timeFrameHours > TIME_DEFAULTS.FINE_TUNING_THRESHOLD_HOURS) {
      console.log('Large window requested. Skipping fine-tuning.');

      return {
        startTime: bestCoarseStart,
        coverageScore: bestCoarseScore,
      };
    }
    const paddingMs =
      TIME_DEFAULTS.PADDING_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;
    const timeFrameMs = timeFrameHours * TIME_DEFAULTS.MS_IN_HOUR;

    const fineStart = new Date(
      Math.max(bestCoarseStart.getTime() - paddingMs, snappedStart.getTime()),
    );
    const fineEnd = new Date(
      Math.min(
        bestCoarseStart.getTime() + timeFrameMs + paddingMs,
        snappedEnd.getTime(),
      ),
    );

    const fineStepMs =
      TIME_DEFAULTS.FINE_STEP_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;
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
      (timeFrameHours * TIME_DEFAULTS.HOURS_TO_MINUTES) /
        TIME_DEFAULTS.FINE_STEP_MINUTES,
    );

    if (fineEntries.length < fineTimeFrameSlots) {
      return { startTime: null, coverageScore: 0 };
    }

    let fineWindowSum = 0;
    for (let i = 0; i < fineTimeFrameSlots; i++) {
      fineWindowSum += fineEntries[i].coverageScore;
    }

    let result: TimeWindowScore = {
      startTime: fineEntries[0].startTime,
      coverageScore: fineWindowSum,
    };

    for (let i = 1; i <= fineEntries.length - fineTimeFrameSlots; i++) {
      fineWindowSum =
        fineWindowSum -
        fineEntries[i - 1].coverageScore +
        fineEntries[i + fineTimeFrameSlots - 1].coverageScore;

      if (fineWindowSum > result.coverageScore) {
        result = {
          startTime: fineEntries[i].startTime,
          coverageScore: fineWindowSum,
        };
      }
    }

    return result;
  }
}
