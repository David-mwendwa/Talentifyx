import mongoose from 'mongoose';

// One row per external source, recording when it was last pulled. It lives in
// the database rather than in memory because the API can restart (or be spun
// down by the host) at any time, and the schedule has to survive that.
const syncStateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    syncedAt: Date,
    lastAttemptAt: Date,
    fetched: Number,
    added: Number,
    updated: Number,
    total: Number,
    durationMs: Number,
    lastError: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('SyncState', syncStateSchema);
