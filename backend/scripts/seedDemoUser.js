import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import Resume from '../models/Resume.js';
import { buildSampleCv, sampleCvFilename } from './sampleCv.js';
import { hashPassword } from '../utils/passwordUtils.js';
import { APPLICATION_STATUS } from '../utils/constants.js';

const DEMO = {
  name: 'Demo',
  lastName: 'Candidate',
  email: 'demo@talentifyx.dev',
  headline: 'Fullstack engineer — React & Node',
  location: 'Nairobi, Kenya',
  desiredRole: 'Senior Fullstack Engineer',
  yearsExperience: 5,
  salaryExpectation: '$90,000',
  stack: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker'],
};

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

// Enough variety that every dashboard panel has something real to render:
// an overdue follow-up, one due today, notes, and a contact.
const TRACKS = [
  { status: APPLICATION_STATUS.SAVED, followUpIn: 3 },
  { status: APPLICATION_STATUS.SAVED },
  {
    status: APPLICATION_STATUS.APPLIED,
    followUpIn: -2,
    notes: 'Applied through their portal. Recruiter said to expect a reply within a week.',
    contactName: 'Anna Weber',
    contactEmail: 'anna.weber@example.com',
  },
  {
    status: APPLICATION_STATUS.APPLIED,
    followUpIn: 0,
    notes: 'Referred by a former colleague — ping them if nothing lands today.',
  },
  {
    status: APPLICATION_STATUS.INTERVIEW,
    followUpIn: 2,
    notes: 'First call went well. Take-home is a small React dashboard, due Friday.',
    contactName: 'Tom Fischer',
    contactEmail: 'tom.fischer@example.com',
    salaryExpectation: '$95,000',
  },
  {
    status: APPLICATION_STATUS.REJECTED,
    notes: 'Wanted 8+ years on Kubernetes. Worth revisiting once I have more infra depth.',
  },
];

try {
  await mongoose.connect(process.env.MONGO_URI);

  const previous = await User.findOne({ email: DEMO.email });
  // Applications and the CV are keyed by user id, so they have to go with the
  // old user or they linger as orphans no query will ever reach.
  if (previous) {
    await Promise.all([
      Application.deleteMany({ user: previous._id }),
      Resume.deleteOne({ user: previous._id }),
      User.deleteOne({ _id: previous._id }),
    ]);
  }
  const user = await User.create({
    ...DEMO,
    password: await hashPassword('demopass123'),
  });

  const cv = buildSampleCv(DEMO);
  const cvName = sampleCvFilename(DEMO);
  await Resume.create({
    user: user._id,
    filename: cvName,
    mimeType: 'application/pdf',
    size: cv.length,
    data: cv,
  });
  await User.findByIdAndUpdate(user._id, {
    resumeName: cvName,
    resumeSize: cv.length,
    resumeUploadedAt: new Date(),
  });

  const jobs = await Job.find({ stack: { $in: DEMO.stack } }).limit(TRACKS.length);

  await Application.insertMany(
    jobs.map((job, i) => {
      const { status, followUpIn, ...rest } = TRACKS[i];
      return {
        ...rest,
        user: user._id,
        job: job._id,
        status,
        followUpAt: followUpIn === undefined ? null : daysFromNow(followUpIn),
        appliedAt: status === APPLICATION_STATUS.SAVED ? null : new Date(),
        history:
          status === APPLICATION_STATUS.SAVED
            ? [{ status, at: new Date() }]
            : [
                { status: APPLICATION_STATUS.SAVED, at: daysFromNow(-7) },
                { status, at: daysFromNow(-2) },
              ],
      };
    })
  );

  console.log(`demo user ready: ${DEMO.email} / demopass123`);
  console.log(`seeded ${jobs.length} tracked applications and a sample CV`);
  await mongoose.connection.close();
} catch (error) {
  console.error(error);
  process.exit(1);
}
