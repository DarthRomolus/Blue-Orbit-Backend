import { TimeWindowScore } from './timeWindowScore';

export type CoverageTimelinePoint = {
  timestamp: string;
  coverageScore: number;
};

export type VisibilityResult = {
  bestWindow: TimeWindowScore;
  coverageTimeline: CoverageTimelinePoint[];
};
