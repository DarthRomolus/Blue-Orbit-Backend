import { Injectable } from '@nestjs/common';
import { OrbitalClientService } from 'src/orbital-client/orbital-client.service';
import { SatellitePositionGeodetic } from 'src/common/types/satellite';
import { Coordinates } from 'src/common/types/coordinates';
import { ReducedSatelliteData } from 'src/common/types/reducedSatelliteData.dto';
import * as satellite from 'satellite.js';
import {
  calculateCoverageScore,
  calculateEffectiveRadius,
} from 'src/common/utils/geo-calculations.utils';
import { TimeWindowScore } from 'src/common/types/timeWindowScore';
import { TIME_DEFUALTS } from 'src/common/constants/time.constants';

@Injectable()
export class VisibilityService {
  constructor(private readonly orbitalClientService: OrbitalClientService) {}

  async calculateSatellitePositionById(
    noradID: string,
  ): Promise<SatellitePositionGeodetic> {
    const satellite: SatellitePositionGeodetic =
      await this.orbitalClientService.getSatellitePosition(noradID);
    return {
      longitude: satellite.longitude,
      latitude: satellite.latitude,
      height: satellite.height,
    };
  }
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
  async momentaryCoverageScore(
    startDate: Date,
    endDate: Date,
    locationCenter: Coordinates,
    locationRadiusKm: number,
  ): Promise<Map<number, number>> {
    const momentaryCoverageScore: Map<number, number> = new Map();
    let currentTime: Date = new Date(startDate);

    const reducedSatelliteData: ReducedSatelliteData[] =
      await this.orbitalClientService.getReducedAllSatelliteInfo();

    const satrecs: satellite.SatRec[] = [];
    for (const data of reducedSatelliteData) {
      try {
        const satrec = satellite.twoline2satrec(data.line1, data.line2);
        satrecs.push(satrec);
      } catch {}
    }

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
      currentTime.setMinutes(currentTime.getMinutes() + 2);
    }

    return momentaryCoverageScore;
  }
  //------------------------------------------------dev(make sliding window)---------------
  async calculateMaxCoverageTimeWindow(
    startDate: Date,
    endDate: Date,
    locationCenter: Coordinates,
    locationRadiusKm: number,
    timeFrameHours: number,
  ): Promise<TimeWindowScore> {
    const timeFrameMinute =
      timeFrameHours *
      TIME_DEFUALTS.HOURS_TO_MINUTES *
      TIME_DEFUALTS.TWO_MINUTES_TIME_FRAMES;
    let maxCoverageTimeWindow: TimeWindowScore = {
      startTime: null,
      coverageScore: 0,
    };
    const coverageScoreMap = await this.momentaryCoverageScore(
      startDate,
      endDate,
      locationCenter,
      locationRadiusKm,
    );
    const entries: TimeWindowScore[] = Array.from(
      coverageScoreMap,
      ([timestamp, coverageScore]) => {
        return { startTime: new Date(timestamp), coverageScore };
      },
    );
    for (let i = 0; i < entries.length; i++) {
      let momentaryCoverageScoreSum = 0;
      for (let j = i; j < i + timeFrameMinute; j++) {
        momentaryCoverageScoreSum =
          momentaryCoverageScoreSum + entries[j].coverageScore;
      }
      if (momentaryCoverageScoreSum > maxCoverageTimeWindow.coverageScore) {
        maxCoverageTimeWindow.coverageScore = momentaryCoverageScoreSum;
        maxCoverageTimeWindow.startTime = entries[i].startTime;
      }
    }
    return maxCoverageTimeWindow;
  }
}
