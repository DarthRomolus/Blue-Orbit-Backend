export const RMQ_CONSTANTS = {
  MISSION_QUEUE: 'mission_queue',
  QUEUE_OPTIONS: {
    durable: false,
  },
} as const;

export const RMQ_PATTERNS = {
  // Pattern for pathfinding-service sending results
  SAVE_MISSION_RESULT: { cmd: 'save_mission_result' },
  
  // Patterns for Gateway requesting data
  GET_ALL_MISSIONS: { cmd: 'get_all_missions' },
  GET_MISSION_BY_ID: { cmd: 'get_mission_by_id' },
} as const;
