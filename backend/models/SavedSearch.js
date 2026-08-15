import mongoose from 'mongoose';

const savedSearchSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: { type: String, required: true },
    // The /jobs querystring this search reproduces, stored as given so the
    // frontend can drop it straight back into the URL.
    query: { type: Map, of: String, default: {} },
    // Result count when the search was last opened, so we can say "3 new".
    lastSeenCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('SavedSearch', savedSearchSchema);
