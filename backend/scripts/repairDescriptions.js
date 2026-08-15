import 'dotenv/config';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import { decodeEscapedHtml, sanitizeHtml } from '../utils/sanitize.js';
import { stripHtml } from '../utils/stack.js';

// Ingest only rewrites listings still present in the Arbeitnow feed, so jobs that
// have since rolled off keep whatever the sanitizer produced the day they were
// pulled. Run this after changing the sanitizer to bring stored rows up to date.
try {
  await mongoose.connect(process.env.MONGO_URI);

  const jobs = await Job.find({}, 'description excerpt');
  let repaired = 0;

  for (const job of jobs) {
    const html = sanitizeHtml(decodeEscapedHtml(job.description));
    if (html === job.description) continue;

    job.description = html;
    job.excerpt = stripHtml(html).slice(0, 320);
    await job.save();
    repaired++;
  }

  console.log(`checked ${jobs.length} jobs — repaired ${repaired}`);
  await mongoose.connection.close();
} catch (error) {
  console.error(error);
  process.exit(1);
}
