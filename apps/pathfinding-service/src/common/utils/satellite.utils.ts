import * as satellite from 'satellite.js';
import { Logger } from '@nestjs/common';
import type { SatelliteTle } from 'src/common/types/reducedSatelliteData';

const logger = new Logger('SatelliteUtils');

/**
 * Parses an array of TLE data into satellite.js SatRec objects.
 * Logs a warning for any TLE that fails to parse.
 */
export function buildSatrecs(satellites: SatelliteTle[]): satellite.SatRec[] {
  const satrecs: satellite.SatRec[] = [];
  for (const sat of satellites) {
    try {
      satrecs.push(satellite.twoline2satrec(sat.line1, sat.line2));
    } catch (error) {
      logger.warn(`Failed to parse TLE for satellite ${sat.noradId}: ${error}`);
    }
  }
  return satrecs;
}
