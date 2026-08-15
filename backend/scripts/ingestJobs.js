import 'dotenv/config';
import mongoose from 'mongoose';
import { ingestJobs } from '../services/ingest.js';

const pages = Number(process.argv[2]) || 6;

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`fetching ${pages} page(s) from Arbeitnow...`);
  const summary = await ingestJobs({ pages });

  console.log(
    `ingested ${summary.fetched} tech jobs — ${summary.added} new, ${summary.updated} updated`
  );
  console.log(`total jobs in database: ${summary.total}`);
  await mongoose.connection.close();
} catch (error) {
  console.error(error);
  process.exit(1);
}
