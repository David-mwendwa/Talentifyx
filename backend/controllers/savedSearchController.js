import { StatusCodes } from 'http-status-codes';
import SavedSearch from '../models/SavedSearch.js';
import Job from '../models/Job.js';
import { BadRequestError, NotFoundError } from '../errors/customErrors.js';
import { buildJobQuery } from '../utils/jobQuery.js';

export const getSavedSearches = async (req, res) => {
  const searches = await SavedSearch.find({ user: req.user.userId }).sort({
    createdAt: -1,
  });

  // Each search is re-run so the list can show what it would return right now,
  // and how much of that is new since the user last opened it.
  const withCounts = await Promise.all(
    searches.map(async (search) => {
      const query = Object.fromEntries(search.query);
      const count = await Job.countDocuments(buildJobQuery(query));
      return {
        ...search.toObject(),
        query,
        count,
        newCount: Math.max(count - search.lastSeenCount, 0),
      };
    })
  );

  res.status(StatusCodes.OK).json({ searches: withCounts });
};

export const createSavedSearch = async (req, res) => {
  const { name, query = {} } = req.body;
  if (!name?.trim()) throw new BadRequestError('a name is required');

  const count = await Job.countDocuments(buildJobQuery(query));
  const search = await SavedSearch.create({
    user: req.user.userId,
    name: name.trim(),
    query,
    lastSeenCount: count,
  });

  res.status(StatusCodes.CREATED).json({ search });
};

// Called when the user opens a saved search — clears its "new" badge.
export const markSearchSeen = async (req, res) => {
  const search = await SavedSearch.findOne({
    _id: req.params.id,
    user: req.user.userId,
  });
  if (!search) throw new NotFoundError('saved search not found');

  search.lastSeenCount = await Job.countDocuments(
    buildJobQuery(Object.fromEntries(search.query))
  );
  await search.save();

  res.status(StatusCodes.OK).json({ search });
};

export const deleteSavedSearch = async (req, res) => {
  const search = await SavedSearch.findOneAndDelete({
    _id: req.params.id,
    user: req.user.userId,
  });
  if (!search) throw new NotFoundError('saved search not found');
  res.status(StatusCodes.OK).json({ message: 'saved search removed' });
};
