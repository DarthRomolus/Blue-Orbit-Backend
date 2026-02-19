import { timeStepCoverageScore } from './coverage.logic';
import { Coordinates } from '../../common/types/coordinates';
import { ReducedSatelliteData } from 'src/common/types/reducedSatelliteData';

interface WorkerJobData {
  startDate: string | Date;
  endDate: string | Date;
  locationCenter: Coordinates;
  locationRadiusKm: number;
  stepMinutes: number;
  reducedSatelliteData: ReducedSatelliteData[];
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
