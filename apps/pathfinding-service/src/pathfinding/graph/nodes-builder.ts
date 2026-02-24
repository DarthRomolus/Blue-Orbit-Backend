import { calculateDestination } from 'src/common/utils/geo-calculations.utils';
import { ChildrenStates, State } from './state';
import { PATHFINDING_DEFAULTS } from 'src/common/constants/pathfinding.constants';
import { TIME_DEFAULTS } from 'src/common/constants/time.constants';

// פונקציית עזר לשמירת זווית חוקית במצפן (0-360)
function normalizeBearing(bearing: number): number {
  return ((bearing % 360) + 360) % 360;
}

export function nodesBuilder(currentState: State): ChildrenStates {
  const distanceKm = PATHFINDING_DEFAULTS.DISTANCE_TO_NEXT_NODE_KM;
  const nextTime = new Date(
    currentState.time.getTime() + PATHFINDING_DEFAULTS.TIME_STEP_SECONDS * 1000,
  );

  // 2. חישוב הקואורדינטות של 3 היעדים בעזרת הכיוון הממוצע (15 מעלות)
  const leftCoords = calculateDestination(
    currentState,

    normalizeBearing(
      currentState.bearingDegrees +
        PATHFINDING_DEFAULTS.AVG_LEFT_TURN_BEARING_CHANGE,
    ),
    distanceKm,
  );

  const rightCoords = calculateDestination(
    currentState,
    normalizeBearing(
      currentState.bearingDegrees +
        PATHFINDING_DEFAULTS.AVG_RIGHT_TURN_BEARING_CHANGE,
    ),
    distanceKm,
  );

  const straightCoords = calculateDestination(
    currentState,
    currentState.bearingDegrees, // אין שינוי כיוון
    distanceKm,
  );

  // 3. בניית הילדים כ*אובייקטים חדשים לחלוטין* תוך העתקת שאר הנתונים
  return {
    left: {
      ...currentState, // מעתיק את כל הנתונים (כמו גובה) לאובייקט חדש
      latitude: leftCoords.latitude,
      longitude: leftCoords.longitude,
      bearingDegrees: normalizeBearing(
        currentState.bearingDegrees +
          PATHFINDING_DEFAULTS.LEFT_TURN_STATE_BEARING_CHANGE,
      ),
      time: nextTime,
    },
    right: {
      ...currentState,
      latitude: rightCoords.latitude,
      longitude: rightCoords.longitude,
      bearingDegrees: normalizeBearing(
        currentState.bearingDegrees +
          PATHFINDING_DEFAULTS.RIGHT_TURN_STATE_BEARING_CHANGE,
      ),
      time: nextTime,
    },
    straight: {
      ...currentState,
      latitude: straightCoords.latitude,
      longitude: straightCoords.longitude,
      bearingDegrees: currentState.bearingDegrees,
      time: nextTime,
    },
  };
}
