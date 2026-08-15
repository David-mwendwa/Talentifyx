import { StatusCodes } from 'http-status-codes';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { NotFoundError } from '../errors/customErrors.js';
import { JOB_SORT_BY } from '../utils/constants.js';
import { buildJobQuery } from '../utils/jobQuery.js';
import { ALL_STACKS } from '../utils/stack.js';
import { getSyncState } from '../services/ingest.js';

const SORT_OPTIONS = {
  [JOB_SORT_BY.NEWEST]: { postedAt: -1 },
  [JOB_SORT_BY.OLDEST]: { postedAt: 1 },
  [JOB_SORT_BY.ASCENDING]: { title: 1 },
  [JOB_SORT_BY.DESCENDING]: { title: -1 },
};

export const getAllJobs = async (req, res) => {
  const { sort = JOB_SORT_BY.NEWEST } = req.query;
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  const query = buildJobQuery(req.query);
  const [jobs, totalJobs] = await Promise.all([
    Job.find(query)
      .sort(SORT_OPTIONS[sort] || SORT_OPTIONS[JOB_SORT_BY.NEWEST])
      .skip((page - 1) * limit)
      .limit(limit),
    Job.countDocuments(query),
  ]);

  res.status(StatusCodes.OK).json({
    jobs,
    totalJobs,
    numOfPages: Math.ceil(totalJobs / limit),
    currentPage: page,
  });
};

export const getJob = async (req, res) => {
  const job = await Job.findOne({ slug: req.params.slug });
  if (!job) throw new NotFoundError(`no job with slug ${req.params.slug}`);

  const related = await Job.find({
    _id: { $ne: job._id },
    stack: { $in: job.stack },
  })
    .sort({ postedAt: -1 })
    .limit(4);

  res.status(StatusCodes.OK).json({ job, related });
};

export const getFilters = async (req, res) => {
  // Every count here is one round trip, so they all go out together — an awaited
  // count inside the response body would have serialised behind the rest.
  const [stackCounts, topLocations, totalJobs, companyCount, remoteJobs] =
    await Promise.all([
      Job.aggregate([
        { $unwind: '$stack' },
        { $group: { _id: '$stack', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Job.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
      ]),
      Job.estimatedDocumentCount(),
      // Counting distinct companies in the database beats shipping the whole
      // list of names back just to read its length.
      Job.aggregate([
        { $group: { _id: '$company' } },
        { $count: 'total' },
      ]),
      Job.countDocuments({ remote: true }),
    ]);

  const sync = await getSyncState();

  res.status(StatusCodes.OK).json({
    stacks: stackCounts.map(({ _id, count }) => ({ name: _id, count })),
    allStacks: ALL_STACKS,
    locations: topLocations.map(({ _id, count }) => ({ name: _id, count })),
    totalJobs,
    totalCompanies: companyCount[0]?.total || 0,
    remoteJobs,
    syncedAt: sync?.syncedAt || null,
  });
};

// Ranks open jobs against the signed-in user's stack — the "precision matching" surface.
export const getMatchedJobs = async (req, res) => {
  const user = await User.findById(req.user.userId);
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  if (!user.stack.length) {
    const jobs = await Job.find().sort({ postedAt: -1 }).limit(limit);
    return res.status(StatusCodes.OK).json({ jobs, matched: false });
  }

  const jobs = await Job.aggregate([
    { $match: { stack: { $in: user.stack } } },
    {
      $addFields: {
        matchedStack: { $setIntersection: ['$stack', user.stack] },
      },
    },
    {
      $addFields: {
        matchScore: {
          $round: [
            {
              $multiply: [
                { $divide: [{ $size: '$matchedStack' }, user.stack.length] },
                100,
              ],
            },
          ],
        },
      },
    },
    { $sort: { matchScore: -1, postedAt: -1 } },
    { $limit: limit },
  ]);

  res.status(StatusCodes.OK).json({ jobs, matched: true, stack: user.stack });
};

export const getJobStats = async (req, res) => {
  const [byStack, bySeniority] = await Promise.all([
    Job.aggregate([
      { $unwind: '$stack' },
      { $group: { _id: '$stack', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]),
    Job.aggregate([{ $group: { _id: '$seniority', count: { $sum: 1 } } }]),
  ]);

  res.status(StatusCodes.OK).json({
    demandByStack: byStack.map(({ _id, count }) => ({ stack: _id, count })),
    bySeniority: bySeniority.map(({ _id, count }) => ({ seniority: _id, count })),
  });
};

// "What should I learn next" — for each technology the user does NOT have, count
// the roles that would open up if they added it. Only jobs that already overlap
// the user's stack are considered, so the answer is the adjacent step rather
// than whatever happens to be most common on the whole board.
export const getSkillGaps = async (req, res) => {
  const user = await User.findById(req.user.userId);
  if (!user.stack.length) {
    return res.status(StatusCodes.OK).json({ gaps: [], hasStack: false });
  }

  const gaps = await Job.aggregate([
    { $match: { stack: { $in: user.stack } } },
    { $unwind: '$stack' },
    { $match: { stack: { $nin: user.stack } } },
    { $group: { _id: '$stack', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);

  res.status(StatusCodes.OK).json({
    hasStack: true,
    gaps: gaps.map(({ _id, count }) => ({ stack: _id, unlocks: count })),
  });
};
