import { Injectable } from '@nestjs/common';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import { SatellitePositionGeodetic } from 'src/common/types/satellite';
import { Coordinates } from 'src/common/types/coordinates';
import { ReducedSatelliteData } from 'src/common/types/reducedSatelliteData';
import * as satellite from 'satellite.js';
import {
  calculateCoverageScore,
  calculateEffectiveRadius,
} from 'src/common/utils/geo-calculations.utils';
import { TimeWindowScore } from 'src/common/types/timeWindowScore';
import { TIME_DEFAULTS } from 'src/common/constants/time.constants';

@Injectable()
export class VisibilityService {
  constructor(private readonly orbitalClientService: OrbitalClientService) {}
  private calculateSatellitePositionBySatrec(
    satrec: satellite.SatRec,
    date: Date,
  ): SatellitePositionGeodetic | undefined {
    const positionAndVelocity = satellite.propagate(satrec, date);
    if (
      !positionAndVelocity?.position ||
      typeof positionAndVelocity.position !== 'object'
    ) {
      return undefined;
    }
    const positionEci: satellite.EciVec3<number> = positionAndVelocity.position;
    const gmst = satellite.gstime(date);
    const positionGdRadians: SatellitePositionGeodetic =
      satellite.eciToGeodetic(positionEci, gmst);
    const positionGdDegrees: SatellitePositionGeodetic = {
      latitude: satellite.radiansToDegrees(positionGdRadians.latitude),
      longitude: satellite.radiansToDegrees(positionGdRadians.longitude),
      height: positionGdRadians.height,
    };
    return positionGdDegrees;
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

  private async buildSatrecs(
    reducedSatelliteData: ReducedSatelliteData[],
  ): Promise<satellite.SatRec[]> {
    const satrecs: satellite.SatRec[] = [];
    for (const data of reducedSatelliteData) {
      try {
        satrecs.push(satellite.twoline2satrec(data.line1, data.line2));
      } catch {}
    }
    return satrecs;
  }

  private async momentaryCoverageScore(
    startDate: Date,
    endDate: Date,
    locationCenter: Coordinates,
    locationRadiusKm: number,
    stepMinutes: number = TIME_DEFAULTS.FINE_STEP_MINUTES,
    prebuiltSatrecs?: satellite.SatRec[],
  ): Promise<Float64Array> {
    let satrecs: satellite.SatRec[];
    if (prebuiltSatrecs) {
      satrecs = prebuiltSatrecs;
    } else {
      const reducedSatelliteData = await this.fetchTleData();
      satrecs = await this.buildSatrecs(reducedSatelliteData);
    }

    const stepMs = stepMinutes * TIME_DEFAULTS.MS_IN_MINUTE;
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    const slotCount = Math.floor((endTimestamp - startTimestamp) / stepMs) + 1;
    const scores = new Float64Array(slotCount);

    const currentTime = new Date(startTimestamp);
    let timestamp = startTimestamp;

    for (let i = 0; i < slotCount; i++) {
      currentTime.setTime(timestamp);
      let timeWindowScore = 0;

      for (const satrec of satrecs) {
        const positionGd = this.calculateSatellitePositionBySatrec(
          satrec,
          currentTime,
        );
        if (!positionGd) {
          continue;
        }
        const satelliteCoverageCenter: Coordinates = {
          latitude: positionGd.latitude,
          longitude: positionGd.longitude,
        };
        const satelliteCoverageRadius = calculateEffectiveRadius(
          positionGd.height,
        );
        const satelliteScore = calculateCoverageScore(
          locationCenter,
          locationRadiusKm,
          satelliteCoverageCenter,
          satelliteCoverageRadius,
        );

        timeWindowScore += satelliteScore;
      }
      scores[i] = timeWindowScore;
      timestamp += stepMs;
    }

    return scores;
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
    const satrecsCoarse = await this.buildSatrecs(reducedSatelliteData);
    const satrecsFine = await this.buildSatrecs(reducedSatelliteData);

    const coarseStepMs =
      TIME_DEFAULTS.COARSE_STEP_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;
    const coarseScores = await this.momentaryCoverageScore(
      snappedStart,
      snappedEnd,
      locationCenter,
      locationRadiusKm,
      TIME_DEFAULTS.COARSE_STEP_MINUTES,
      satrecsCoarse,
    );

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
    const fineScores = await this.momentaryCoverageScore(
      fineStart,
      fineEnd,
      locationCenter,
      locationRadiusKm,
      TIME_DEFAULTS.FINE_STEP_MINUTES,
      satrecsFine,
    );

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
