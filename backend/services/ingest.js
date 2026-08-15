import Job from '../models/Job.js';
import SyncState from '../models/SyncState.js';
import { fetchJobs } from './arbeitnow.js';

export const SYNC_KEY = 'arbeitnow';

// Shared by the manual `npm run ingest` script and the scheduler, so a scheduled
// refresh and a hand-run one can never drift apart.
export const ingestJobs = async ({ pages = 6 } = {}) => {
  const startedAt = new Date();
  const jobs = await fetchJobs({ pages });

  const result = await Job.bulkWrite(
    jobs.map((job) => ({
      updateOne: {
        filter: { slug: job.slug },
        update: { $set: job },
        upsert: true,
      },
    }))
  );

  const summary = {
    fetched: jobs.length,
    added: result.upsertedCount,
    updated: result.modifiedCount,
    total: await Job.countDocuments(),
    syncedAt: new Date(),
    durationMs: Date.now() - startedAt.getTime(),
  };

  await SyncState.findOneAndUpdate(
    { key: SYNC_KEY },
    { ...summary, lastError: '' },
    { upsert: true }
  );

  return summary;
};

export const getSyncState = () => SyncState.findOne({ key: SYNC_KEY });

export const recordSyncFailure = (error) =>
  SyncState.findOneAndUpdate(
    { key: SYNC_KEY },
    { lastError: error.message, lastAttemptAt: new Date() },
    { upsert: true }
  );
