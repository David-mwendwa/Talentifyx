import { getSyncState, ingestJobs, recordSyncFailure } from './ingest.js';

const HOUR = 60 * 60 * 1000;

// How old the data may get before a refresh is due.
const MAX_AGE_MS = Number(process.env.SYNC_INTERVAL_HOURS || 12) * HOUR;
// How often to wake up and check. Checking is a single indexed read, so this is
// cheap; the actual fetch only happens when the data is genuinely stale.
const CHECK_INTERVAL_MS = HOUR;

let running = false;

const isStale = (state) =>
  !state?.syncedAt || Date.now() - state.syncedAt.getTime() >= MAX_AGE_MS;

export const syncIfStale = async ({ force = false } = {}) => {
  // A slow fetch must not overlap with the next tick, or with the boot check.
  if (running) return null;

  const state = await getSyncState();
  if (!force && !isStale(state)) return null;

  running = true;
  try {
    const summary = await ingestJobs();
    console.log(
      `job sync: ${summary.fetched} fetched, ${summary.added} new, ${summary.updated} updated (${summary.durationMs}ms)`
    );
    return summary;
  } catch (error) {
    // A failed sync must never take the API down with it — the existing
    // listings stay served and the next tick tries again.
    console.error('job sync failed:', error.message);
    await recordSyncFailure(error);
    return null;
  } finally {
    running = false;
  }
};

export const startScheduler = () => {
  if (process.env.AUTO_SYNC === 'off') {
    console.log('job sync: disabled (AUTO_SYNC=off)');
    return;
  }

  // Checked on boot as well as on a timer: free hosting tiers spin the service
  // down when idle, so a long-running timer alone would never fire.
  syncIfStale();

  const timer = setInterval(syncIfStale, CHECK_INTERVAL_MS);
  timer.unref?.();
};
