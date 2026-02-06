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

  private async buildSatrecs(): Promise<satellite.SatRec[]> {
    //OK
    const reducedSatelliteData: ReducedSatelliteData[] =
      await this.orbitalClientService.getReducedAllSatelliteInfo();

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
  ): Promise<Map<number, number>> {
    const momentaryCoverageScore: Map<number, number> = new Map();
    let currentTime: Date = new Date(startDate);

    const satrecs = prebuiltSatrecs ?? (await this.buildSatrecs());

    while (currentTime <= endDate) {
      const timestamp = currentTime.getTime();
      momentaryCoverageScore.set(timestamp, 0);
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
      momentaryCoverageScore.set(timestamp, timeWindowScore);
      currentTime = new Date(currentTime.getTime() + stepMinutes * 60_000); //dev
    }

    return momentaryCoverageScore;
  }
  //-----------------------------------------------dev----------------------

  async calculateMaxCoverageTimeWindow(
    startDate: Date,
    endDate: Date,
    locationCenter: Coordinates,
    locationRadiusKm: number,
    timeFrameHours: number,
  ): Promise<TimeWindowScore> {
    const timeFrameSlots = Math.floor(
      (timeFrameHours * TIME_DEFAULTS.HOURS_TO_MINUTES) /
        TIME_DEFAULTS.FINE_STEP_MINUTES,
    );

    let maxCoverageTimeWindow: TimeWindowScore = {
      startTime: null,
      coverageScore: 0,
    };
    let windowSum: number = 0;
    const coverageScoreMap = await this.momentaryCoverageScore(
      startDate,
      endDate,
      locationCenter,
      locationRadiusKm,
      TIME_DEFAULTS.FINE_STEP_MINUTES,
    );
    const entries: TimeWindowScore[] = Array.from(
      coverageScoreMap,
      ([timestamp, coverageScore]) => {
        return { startTime: new Date(timestamp), coverageScore };
      },
    );
    if (entries.length < timeFrameSlots) {
      return { startTime: null, coverageScore: 0 };
    }
    for (let i = 0; i < timeFrameSlots; i++) {
      windowSum = windowSum + entries[i].coverageScore;
    }
    maxCoverageTimeWindow.startTime = entries[0].startTime;
    maxCoverageTimeWindow.coverageScore = windowSum;

    for (let i = 1; i <= entries.length - timeFrameSlots; i++) {
      windowSum =
        windowSum -
        entries[i - 1].coverageScore +
        entries[i + timeFrameSlots - 1].coverageScore;

      if (windowSum > maxCoverageTimeWindow.coverageScore) {
        maxCoverageTimeWindow.coverageScore = windowSum;
        maxCoverageTimeWindow.startTime = entries[i].startTime;
      }
    }
    return maxCoverageTimeWindow;
  }
  //-----------------------------------------------dev----------------------
  async calculateMaxCoverageTimeWindowOptimized(
    startDate: Date,
    endDate: Date,
    locationCenter: Coordinates,
    locationRadiusKm: number,
    timeFrameHours: number,
  ): Promise<TimeWindowScore> {
    const satrecs = await this.buildSatrecs();

    const coarseScoreMap = await this.momentaryCoverageScore(
      startDate,
      endDate,
      locationCenter,
      locationRadiusKm,
      TIME_DEFAULTS.COARSE_STEP_MINUTES,
      satrecs,
    );

    // ── Step 2: Coarse Sliding Window ────────────────────────────────
    const coarseEntries: TimeWindowScore[] = Array.from(
      coarseScoreMap,
      ([timestamp, coverageScore]) => ({
        startTime: new Date(timestamp),
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

    // ── Step 3: Define Fine-Tuning Range (±20 min padding) ──────────
    const paddingMs = TIME_DEFAULTS.PADDING_MINUTES * 60_000;
    const timeFrameMs = timeFrameHours * 3_600_000;

    const fineStart = new Date(
      Math.max(bestCoarseStart.getTime() - paddingMs, startDate.getTime()),
    );
    const fineEnd = new Date(
      Math.min(
        bestCoarseStart.getTime() + timeFrameMs + paddingMs,
        endDate.getTime(),
      ),
    );

    // ── Step 4: Fine Scan (1-min resolution over candidate window) ──
    const fineScoreMap = await this.momentaryCoverageScore(
      fineStart,
      fineEnd,
      locationCenter,
      locationRadiusKm,
      TIME_DEFAULTS.FINE_STEP_MINUTES,
      satrecs,
    );

    // ── Step 5: Final Sliding Window ─────────────────────────────────
    const fineEntries = Array.from(
      fineScoreMap,
      ([timestamp, coverageScore]) => ({
        startTime: new Date(timestamp),
        coverageScore,
      }),
    );

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
