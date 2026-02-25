export const PATHFINDING_DEFAULTS = {
  /** Time step in seconds between node expansions */
  TIME_STEP_SECONDS: 10,

  /** Standard rate turn: 3 degrees per second */
  TURN_RATE_DEG_PER_SEC: 3,

  /** Default aircraft cruise speed in km/h */
  DEFAULT_SPEED_KMH: 700,

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

  /** Goal radius in km - how close to the destination counts as "arrived" */
  GOAL_RADIUS_KM: 2.0,

  /** Maximum number of nodes to explore before giving up */
  MAX_ITERATIONS: 500_000,

  /** Distance threshold (in km) to switch from fast to fine time steps */
  DYNAMIC_STEP_DISTANCE_THRESHOLD_KM: 500,

  /** Fast time step in seconds when far from goal */
  DYNAMIC_STEP_FAST_SECONDS: 60,

  /** Size of the bearing bucket in degrees for state deduplication */
  BEARING_BUCKET_SIZE_DEG: 15,

  // --- MICRO MANEUVERS (Close range, 10s steps) ---
  /** Average bearing change during a micro left turn */
  MICRO_AVG_LEFT_TURN_BEARING_CHANGE: -15,
  /** Average bearing change during a micro right turn */
  MICRO_AVG_RIGHT_TURN_BEARING_CHANGE: 15,
  /** Final bearing change after a micro left turn */
  MICRO_LEFT_TURN_STATE_BEARING_CHANGE: -30,
  /** Final bearing change after a micro right turn */
  MICRO_RIGHT_TURN_STATE_BEARING_CHANGE: 30,

  // --- MACRO MANEUVERS (Long range, 60s steps) ---
  /** Average bearing change during a macro left turn */
  MACRO_AVG_LEFT_TURN_BEARING_CHANGE: -2.5,
  /** Average bearing change during a macro right turn */
  MACRO_AVG_RIGHT_TURN_BEARING_CHANGE: 2.5,
  /** Final bearing change after a macro left turn */
  MACRO_LEFT_TURN_STATE_BEARING_CHANGE: -5,
  /** Final bearing change after a macro right turn */
  MACRO_RIGHT_TURN_STATE_BEARING_CHANGE: 5,

  /**
   * Weighted A* heuristic multiplier (ε).
   * ε = 1.0 → standard A*, guaranteed optimal, slower.
   * ε = 2.0 → path is at most 2× worse than optimal, significantly faster.
   * ε > 2.0 → increasingly greedy, faster but less optimal.
   */
  HEURISTIC_WEIGHT: 2.0,
} as const;
