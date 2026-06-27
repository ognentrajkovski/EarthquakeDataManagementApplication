/**
 * Application-wide constants shared between the frontend and documented
 * alongside the matching backend property so drift is obvious.
 *
 * Backend property: earthquake.polling.interval-ms (default 60000)
 */

/** Auto-refresh interval in milliseconds — must match the backend polling interval. */
export const POLL_INTERVAL_MS = 60_000;
