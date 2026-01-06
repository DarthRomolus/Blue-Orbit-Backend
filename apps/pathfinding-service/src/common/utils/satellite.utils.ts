import * as satellite from 'satellite.js';
import type { SatelliteData } from '../types/satellite';

export function tleToSatrec(satellitesData: SatelliteData[]) {
  return satellitesData.map((singleSatellite) => {
    return {
      ...singleSatellite,
      satrec: satellite.twoline2satrec(
        singleSatellite.line1,
        singleSatellite.line2,
      ),
    };
  });
}
