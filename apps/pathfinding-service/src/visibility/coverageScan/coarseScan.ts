import { Coordinates } from 'src/common/types/coordinates';
import { SatelliteTle } from 'src/common/types/reducedSatelliteData';
import { TimeWindowScore } from 'src/common/types/timeWindowScore';
import { TIME_DEFAULTS } from 'src/common/constants/time.constants';
import { VISIBILITY_DEFAULTS } from 'src/common/constants/visibility.constants';
import Piscina from 'piscina';

export async function runCoarseScan(
    workerPool: Piscina,
    snappedStart: Date,
    snappedEnd: Date,
    locationCenter: Coordinates,
    locationRadiusKm: number,
    reducedSatelliteData: SatelliteTle[]
  ): Promise<TimeWindowScore[]> {
    const batchDurationMs = Math.ceil(
      (snappedEnd.getTime() - snappedStart.getTime()) / VISIBILITY_DEFAULTS.WORKER_POOL_THREAD_COUNT
    );

    const promisesCoarse: Promise<Float64Array>[] = [];
    for (let i = 0; i < VISIBILITY_DEFAULTS.WORKER_POOL_THREAD_COUNT; i++) {
      const batchStartDate = new Date(snappedStart.getTime() + i * batchDurationMs);
      const batchEndDate = new Date(
        Math.min(snappedEnd.getTime(), batchStartDate.getTime() + batchDurationMs)
      );
      promisesCoarse.push(
        workerPool.run({
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