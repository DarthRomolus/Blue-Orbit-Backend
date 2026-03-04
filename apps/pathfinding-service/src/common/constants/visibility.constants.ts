/**
 * Visibility service configuration constants.
 */
export const VISIBILITY_DEFAULTS = {
  /** Number of worker threads for the coverage calculation pool */
  WORKER_POOL_THREAD_COUNT: 6,

  /** Relative path to the compiled coverage worker script */
  COVERAGE_WORKER_FILENAME: 'workers/coverage.worker.js',
} as const;
