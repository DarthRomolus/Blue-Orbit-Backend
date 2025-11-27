import { Injectable } from '@nestjs/common';
import * as satellite from 'satellite.js';

@Injectable()
export class PositionService {
  calculate(tleLine1: string, tleLine2: string, date: Date = new Date()) {
    try {
      const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
      const positionAndVelocity = satellite.propagate(satrec, date);

      if (positionAndVelocity) {
        const positionEci =
          positionAndVelocity.position as satellite.EciVec3<number>;
        const gmst = satellite.gstime(date);
        const positionGd = satellite.eciToGeodetic(positionEci, gmst);
        /*const velocity = {
          x: positionAndVelocity.velocity.x,
          y: positionAndVelocity.velocity.y,
          z: positionAndVelocity.velocity.z,
        };*/

        const position = {
          longitude: satellite.degreesLong(positionGd.longitude),
          latitude: satellite.degreesLat(positionGd.latitude),
          height: positionGd.height * 1000,
        };

        return position;
      }
    } catch (error) {
      return null;
    }
  }
}
