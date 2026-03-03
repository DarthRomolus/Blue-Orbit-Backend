export const PATHFINDING_DEFAULTS = {
  /** Default aircraft cruise speed in km/h */
  DEFAULT_SPEED_KMH: 700,

  /** Number of top satellites to evaluate per node (keep top 4, use best 2) */
  TOP_SATELLITES_COUNT: 4,

  /** Number of active satellite links the aircraft can maintain */
  ACTIVE_LINKS_COUNT: 2,

  /** Distance weight — always pay for distance */
  W_DIST: 1,

  /** Connectivity penalty weight — how much poor coverage hurts */
  W_CONN: 0.5,

  /** Sigmoid midpoint: elevation angle (degrees) where signal quality = 0.5 */
  SIGMOID_MIDPOINT_DEG: 25,

  /** Sigmoid steepness parameter */
  SIGMOID_STEEPNESS: 0.5,

  /** Goal radius in km - how close to the destination counts as "arrived" */
  GOAL_RADIUS_KM: 2.0,

  /** Hard penalty cap (0-1). The "bailout" mechanism — limits how much a
   *  dead zone can penalize the cost. Small holes are still dodged, but
   *  continental-scale dead zones are accepted and crossed. */
  MAX_PENALTY_CAP: 1,

  /** Maximum number of nodes to explore before giving up */
  MAX_ITERATIONS: 500_000,

  /** Distance threshold (in km) to switch from macro to micro steps */
  DYNAMIC_STEP_DISTANCE_THRESHOLD_KM: 500,

  /** Distance threshold (in km) to switch from oceanic to macro steps */
  DYNAMIC_STEP_OCEANIC_THRESHOLD_KM: 3000,

  /** Fine time step in seconds when close to goal */
  DYNAMIC_STEP_FINE_SECONDS: 10,

  /** Fast time step in seconds when at medium range */
  DYNAMIC_STEP_FAST_SECONDS: 120,

  /** Oceanic time step in seconds when very far from goal */
  DYNAMIC_STEP_OCEANIC_SECONDS: 200,

  /** Size of the bearing bucket in degrees for state deduplication */
  BEARING_BUCKET_SIZE_DEG: 15,

  /** Represents about 1770KM in   */
  MAX_DEGRESS_DISTANCE: 16,
  /** Minimum distance from the satellite in km - 1700km is the average radius of LEO satellites footprint with elevation angle of 25 degrees */
  MIN_SATELLITE_DISTANCE_FROM_PLANE_KM: 1700,

  // --- MICRO MANEUVERS (Close range, 10s steps) ---
  /** Average bearing change during a micro left turn */
  MICRO_AVG_LEFT_TURN_BEARING_CHANGE: -15,
  /** Average bearing change during a micro right turn */
  MICRO_AVG_RIGHT_TURN_BEARING_CHANGE: 15,
  /** Final bearing change after a micro left turn */
  MICRO_LEFT_TURN_STATE_BEARING_CHANGE: -30,
  /** Final bearing change after a micro right turn */
  MICRO_RIGHT_TURN_STATE_BEARING_CHANGE: 30,

  // --- MACRO MANEUVERS (Medium range, 120s steps) ---
  /** Average bearing change during a macro left turn */
  MACRO_AVG_LEFT_TURN_BEARING_CHANGE: -5,
  /** Average bearing change during a macro right turn */
  MACRO_AVG_RIGHT_TURN_BEARING_CHANGE: 5,
  /** Final bearing change after a macro left turn */
  MACRO_LEFT_TURN_STATE_BEARING_CHANGE: -10,
  /** Final bearing change after a macro right turn */
  MACRO_RIGHT_TURN_STATE_BEARING_CHANGE: 10,

  // --- OCEANIC MANEUVERS (Very long range, 200s steps) ---
  /** Average bearing change during an oceanic left turn */
  OCEANIC_AVG_LEFT_TURN_BEARING_CHANGE: -3,
  /** Average bearing change during an oceanic right turn */
  OCEANIC_AVG_RIGHT_TURN_BEARING_CHANGE: 3,
  /** Final bearing change after an oceanic left turn */
  OCEANIC_LEFT_TURN_STATE_BEARING_CHANGE: -6,
  /** Final bearing change after an oceanic right turn */
  OCEANIC_RIGHT_TURN_STATE_BEARING_CHANGE: 6,

  // --- ADAPTIVE RESOLUTION ---
  /** Signal quality threshold (0-1) for triggering micro-step zoom-in.
   *  When a node's signal quality drops below this, the next children
   *  are generated with micro-steps for surgical evasion. */
  ZOOM_IN_SIGNAL_THRESHOLD: 0.5,

  /**
   * Weighted A* heuristic multiplier (ε).
   * ε = 1.0 → standard A*, guaranteed optimal, slower.
   * ε = 2.0 → path is at most 2× worse than optimal, significantly faster.
   * ε > 2.0 → increasingly greedy, faster but less optimal.
   */
  HEURISTIC_WEIGHT: 1.6,
} as const;
