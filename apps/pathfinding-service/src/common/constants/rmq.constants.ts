
export const RMQ_CONSTANTS = {
  PATHFINDING_QUEUE: 'pathfinding_queue',
  QUEUE_OPTIONS: {
    durable: false,
  },
} as const;

export const RMQ_PATTERNS = {
  CALCULATE_PATH: { cmd: 'calculate_path' },
  CALCULATE_COVERAGE: { cmd: 'calculate_coverage' },
  SATELLITE_POSITION: { cmd: 'satellite_position' },
  ALL_SATELLITE_DATA: { cmd: 'all_satellite_data' },
} as const;
