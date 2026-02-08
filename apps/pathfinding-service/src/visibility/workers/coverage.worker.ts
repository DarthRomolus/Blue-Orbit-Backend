import { resolve } from 'path';
import { timeStepCoverageScore } from './coverage.logic';
import { Coordinates } from '../../common/types/coordinates';

interface WorkerJobData {
  startDate: string | Date;
  endDate: string | Date;
  locationCenter: any;
  locationRadiusKm: number;
  stepMinutes: number;
  reducedSatelliteData: any[];
}

export default function (jobData: WorkerJobData) {
  const start = new Date(jobData.startDate);
  const end = new Date(jobData.endDate);

  return timeStepCoverageScore(
    start,
    end,
    jobData.locationCenter,
    jobData.locationRadiusKm,
    jobData.stepMinutes,
    jobData.reducedSatelliteData,
  );
}
