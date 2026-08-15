import mongoose from 'mongoose';

// The file bytes live in their own collection so that loading a user — which
// happens on nearly every authenticated request — never drags a few megabytes of
// PDF along with it. The lightweight metadata sits on the User document instead.
const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    filename: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    data: { type: Buffer, required: true },
  },
  { timestamps: true }
);

export default mongoose.model('Resume', resumeSchema);
