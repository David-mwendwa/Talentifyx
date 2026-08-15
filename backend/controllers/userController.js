import { StatusCodes } from 'http-status-codes';
import User from '../models/User.js';
import Resume from '../models/Resume.js';
import { BadRequestError, NotFoundError } from '../errors/customErrors.js';
import { ALL_STACKS } from '../utils/stack.js';

export const getCurrentUser = async (req, res) => {
  const user = await User.findById(req.user.userId);
  res.status(StatusCodes.OK).json({ user });
};

export const updateProfile = async (req, res) => {
  const TEXT_FIELDS = [
    'name',
    'lastName',
    'headline',
    'location',
    'desiredRole',
    'salaryExpectation',
    'resumeUrl',
    'linkedinUrl',
    'githubUrl',
    'portfolioUrl',
  ];
  const { stack, openToRemote, yearsExperience } = req.body;
  const updates = TEXT_FIELDS.reduce(
    (acc, field) =>
      req.body[field] !== undefined ? { ...acc, [field]: req.body[field] } : acc,
    {}
  );
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      ...updates,
      ...(openToRemote !== undefined ? { openToRemote } : {}),
      ...(yearsExperience !== undefined ? { yearsExperience } : {}),
      ...(stack ? { stack: stack.filter((s) => ALL_STACKS.includes(s)) } : {}),
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({ user });
};

// Filenames come from the client and are echoed back in a Content-Disposition
// header on download, so anything that could break out of the quoted string or
// walk a path is stripped here rather than trusted.
const safeFilename = (name = 'cv') =>
  name
    .replace(/[\\/]/g, '_')
    .replace(/[^\w.\- ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120) || 'cv';

export const uploadResumeFile = async (req, res) => {
  if (!req.file) throw new BadRequestError('no file received');

  const filename = safeFilename(req.file.originalname);

  await Resume.findOneAndUpdate(
    { user: req.user.userId },
    {
      filename,
      mimeType: req.file.mimetype,
      size: req.file.size,
      data: req.file.buffer,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const user = await User.findByIdAndUpdate(
    req.user.userId,
    {
      resumeName: filename,
      resumeSize: req.file.size,
      resumeUploadedAt: new Date(),
    },
    { new: true }
  );

  res.status(StatusCodes.OK).json({ user });
};

export const downloadResume = async (req, res) => {
  const resume = await Resume.findOne({ user: req.user.userId });
  if (!resume) throw new NotFoundError('no CV uploaded yet');

  res.set({
    'Content-Type': resume.mimeType,
    'Content-Length': resume.size,
    // attachment, never inline — the browser must not try to render the file.
    'Content-Disposition': `attachment; filename="${resume.filename}"`,
  });
  res.send(resume.data);
};

export const deleteResume = async (req, res) => {
  await Resume.deleteOne({ user: req.user.userId });
  const user = await User.findByIdAndUpdate(
    req.user.userId,
    { resumeName: '', resumeSize: 0, resumeUploadedAt: null },
    { new: true }
  );

  res.status(StatusCodes.OK).json({ user });
};
