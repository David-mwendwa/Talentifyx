import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    lastName: { type: String, default: '' },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    headline: { type: String, default: '' },
    location: { type: String, default: '' },
    stack: { type: [String], default: [] },
    openToRemote: { type: Boolean, default: true },
    yearsExperience: { type: Number, default: 0 },
    desiredRole: { type: String, default: '' },
    salaryExpectation: { type: String, default: '' },
    // Links a job hunter pastes into applications constantly — kept here so the
    // profile is the one place they live.
    resumeUrl: { type: String, default: '' },
    // Metadata for an uploaded CV; the bytes live in the Resume collection.
    resumeName: { type: String, default: '' },
    resumeSize: { type: Number, default: 0 },
    resumeUploadedAt: Date,
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

export default mongoose.model('User', userSchema);
