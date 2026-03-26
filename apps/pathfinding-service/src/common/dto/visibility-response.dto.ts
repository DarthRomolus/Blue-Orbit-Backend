import { CoverageTimelinePoint } from '../types/visibility.types';

export class VisibilityResponseDto {
  startTime: string | null;
  coverageScore: number;
  coverageTimeline: CoverageTimelinePoint[];
}
