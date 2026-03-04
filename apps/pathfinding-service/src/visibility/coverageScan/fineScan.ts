import { Coordinates } from 'src/common/types/coordinates';
import { SatelliteTle } from 'src/common/types/reducedSatelliteData';
import { TimeWindowScore } from 'src/common/types/timeWindowScore';
import { TIME_DEFAULTS } from 'src/common/constants/time.constants';
import { findBestSlidingWindow } from '../slidingWindow/slidingWindow';
import Piscina from 'piscina';

export async function runFineTuningScan(
    workerPool: Piscina,
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
    const fineStepMs = TIME_DEFAULTS.FINE_STEP_MINUTES * TIME_DEFAULTS.MS_IN_MINUTE;

    const fineStart = new Date(
      Math.max(bestCoarseStart.getTime() - paddingMs, snappedStart.getTime())
    );
    const fineEnd = new Date(
      Math.min(bestCoarseStart.getTime() + timeFrameMs + paddingMs, snappedEnd.getTime())
    );

    const fineScores = (await workerPool.run({
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

    return findBestSlidingWindow(fineEntries, fineTimeFrameSlots);
  }