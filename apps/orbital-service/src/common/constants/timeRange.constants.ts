export const TIME_RANGE = {
  /** Duration of a satellite path prediction (105 minutes ≈ 1 LEO orbit) */
  PATH_DURATION_MS: 105 * 60 * 1000,

  /** Time step between path points in minutes */
  PATH_STEP_MINUTES: 1,
} as const;
