import mongoose from 'mongoose';
import { SENIORITY } from '../utils/constants.js';

const jobSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    source: { type: String, default: 'arbeitnow' },
    sourceUrl: { type: String, required: true },
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, default: 'Unspecified' },
    remote: { type: Boolean, default: false },
    description: { type: String, default: '' },
    excerpt: { type: String, default: '' },
    tags: { type: [String], default: [] },
    jobTypes: { type: [String], default: [] },
    stack: { type: [String], default: [], index: true },
    seniority: {
      type: String,
      enum: Object.values(SENIORITY),
      default: SENIORITY.MID,
    },
    postedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Search is regex-based (substring, case-insensitive), which a text index cannot
// serve — so there is no text index here, only the fields actually filtered on.
jobSchema.index({ remote: 1, seniority: 1 });

export default mongoose.model('Job', jobSchema);
