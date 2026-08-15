import mongoose from 'mongoose';
import { APPLICATION_STATUS } from '../utils/constants.js';

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    job: { type: mongoose.Types.ObjectId, ref: 'Job', required: true },
    status: {
      type: String,
      enum: Object.values(APPLICATION_STATUS),
      default: APPLICATION_STATUS.SAVED,
    },
    notes: { type: String, default: '' },
    // Who you are actually talking to at the company.
    contactName: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    // What you told them / what they told you.
    salaryExpectation: { type: String, default: '' },
    // Drives the "needs a nudge" list on the dashboard.
    followUpAt: Date,
    appliedAt: Date,
    // Every status change, so the drawer can show how the application moved.
    history: {
      type: [
        {
          _id: false,
          status: String,
          at: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

applicationSchema.index({ user: 1, job: 1 }, { unique: true });
applicationSchema.index({ user: 1, followUpAt: 1 });

export default mongoose.model('Application', applicationSchema);
