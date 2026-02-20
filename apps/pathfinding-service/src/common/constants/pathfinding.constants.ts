export const PATHFINDING_DEFAULTS = {
  /** Time step in seconds between node expansions */
  TIME_STEP_SECONDS: 10,

  /** Standard rate turn: 3 degrees per second */
  TURN_RATE_DEG_PER_SEC: 3,

  /** Default aircraft cruise speed in km/h */
  DEFAULT_SPEED_KMH: 250,

  /** Number of top satellites to evaluate per node (keep top 4, use best 2) */
  TOP_SATELLITES_COUNT: 4,

  /** Number of active satellite links the aircraft can maintain */
  ACTIVE_LINKS_COUNT: 2,

  /** Distance weight — always pay for distance */
  W_DIST: 1.0,

  /** Connectivity penalty weight — how much poor coverage hurts */
  W_CONN: 0.3,

  /** Sigmoid midpoint: elevation angle (degrees) where signal quality = 0.5 */
  SIGMOID_MIDPOINT_DEG: 25,

  /** Sigmoid steepness parameter */
  SIGMOID_STEEPNESS: 0.3,

  /** Goal radius in km — how close to the destination counts as "arrived" */
  GOAL_RADIUS_KM: 1.0,

  /** Maximum number of nodes to explore before giving up */
  MAX_ITERATIONS: 500_000,
} as const;
