import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { BadRequestError, NotFoundError } from '../errors/customErrors.js';
import { APPLICATION_STATUS } from '../utils/constants.js';

// Fields a user may edit on an application. Everything else (status, history) is
// managed by the controller so the timeline cannot be rewritten from the client.
const EDITABLE_FIELDS = [
  'notes',
  'contactName',
  'contactEmail',
  'salaryExpectation',
  'followUpAt',
];

const pickEditable = (body) =>
  EDITABLE_FIELDS.reduce((acc, field) => {
    if (body[field] !== undefined) {
      acc[field] = body[field] === '' && field === 'followUpAt' ? null : body[field];
    }
    return acc;
  }, {});

const userId = (req) => new mongoose.Types.ObjectId(req.user.userId);

export const getMyApplications = async (req, res) => {
  const { status } = req.query;
  const query = { user: req.user.userId };
  if (status) query.status = status;

  const applications = await Application.find(query)
    .populate('job')
    .sort({ updatedAt: -1 });

  res.status(StatusCodes.OK).json({ applications });
};

export const trackJob = async (req, res) => {
  const { jobId, status = APPLICATION_STATUS.SAVED } = req.body;

  const job = await Job.findById(jobId);
  if (!job) throw new NotFoundError(`no job with id ${jobId}`);

  const existing = await Application.findOne({
    user: req.user.userId,
    job: jobId,
  });

  // Re-saving a job you already track must not reset the pipeline stage you
  // moved it to, so an existing application only ever moves forward on request.
  if (existing) {
    if (existing.status !== status) {
      existing.status = status;
      existing.history.push({ status, at: new Date() });
      if (status === APPLICATION_STATUS.APPLIED && !existing.appliedAt) {
        existing.appliedAt = new Date();
      }
      await existing.save();
    }
    await existing.populate('job');
    return res.status(StatusCodes.OK).json({ application: existing });
  }

  const application = await Application.create({
    ...pickEditable(req.body),
    user: req.user.userId,
    job: jobId,
    status,
    appliedAt: status === APPLICATION_STATUS.APPLIED ? new Date() : undefined,
    history: [{ status, at: new Date() }],
  });
  await application.populate('job');

  res.status(StatusCodes.CREATED).json({ application });
};

export const updateApplication = async (req, res) => {
  const { status } = req.body;
  if (status && !Object.values(APPLICATION_STATUS).includes(status)) {
    throw new BadRequestError(`invalid status: ${status}`);
  }

  const application = await Application.findOne({
    _id: req.params.id,
    user: req.user.userId,
  });
  if (!application) throw new NotFoundError('application not found');

  Object.assign(application, pickEditable(req.body));

  if (status && status !== application.status) {
    application.status = status;
    application.history.push({ status, at: new Date() });
    if (status === APPLICATION_STATUS.APPLIED && !application.appliedAt) {
      application.appliedAt = new Date();
    }
  }

  await application.save();
  await application.populate('job');

  res.status(StatusCodes.OK).json({ application });
};

export const deleteApplication = async (req, res) => {
  const application = await Application.findOneAndDelete({
    _id: req.params.id,
    user: req.user.userId,
  });
  if (!application) throw new NotFoundError('application not found');
  res.status(StatusCodes.OK).json({ message: 'application removed' });
};

export const getApplicationStats = async (req, res) => {
  const [counts, activity, followUps] = await Promise.all([
    Application.aggregate([
      { $match: { user: userId(req) } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.aggregate([
      { $match: { user: userId(req), appliedAt: { $ne: null } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$appliedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
    Application.find({
      user: req.user.userId,
      followUpAt: { $ne: null },
      status: { $nin: [APPLICATION_STATUS.REJECTED, APPLICATION_STATUS.OFFER] },
    })
      .populate('job', 'title company slug')
      .sort({ followUpAt: 1 })
      .limit(10),
  ]);

  const stats = Object.values(APPLICATION_STATUS).reduce(
    (acc, status) => ({ ...acc, [status]: 0 }),
    {}
  );
  counts.forEach(({ _id, count }) => {
    stats[_id] = count;
  });

  // Anything that reached applied, including the stages beyond it.
  const reachedApplied =
    stats.applied + stats.interview + stats.offer + stats.rejected;
  const reachedInterview = stats.interview + stats.offer;

  res.status(StatusCodes.OK).json({
    stats,
    total: Object.values(stats).reduce((sum, n) => sum + n, 0),
    activity: activity.map(({ _id, count }) => ({ date: _id, count })),
    funnel: {
      saved: stats.saved + reachedApplied,
      applied: reachedApplied,
      interview: reachedInterview,
      offer: stats.offer,
      // Interview rate is the number worth quoting in a retro: of everything you
      // actually sent off, how much came back.
      interviewRate: reachedApplied
        ? Math.round((reachedInterview / reachedApplied) * 100)
        : 0,
      offerRate: reachedApplied
        ? Math.round((stats.offer / reachedApplied) * 100)
        : 0,
    },
    followUps,
  });
};
