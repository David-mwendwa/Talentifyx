import multer from 'multer';
import { BadRequestError } from '../errors/customErrors.js';

export const MAX_RESUME_BYTES = 5 * 1024 * 1024;

// Only document formats a recruiter would actually accept. Nothing here can be
// rendered as markup by a browser, which matters because these bytes are served
// back out again later.
const ALLOWED_TYPES = {
  'application/pdf': '.pdf',
  'application/msword': '.doc',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
};

export const ALLOWED_EXTENSIONS = Object.values(ALLOWED_TYPES);

const upload = multer({
  // Kept in memory: the file goes straight into MongoDB, and Render's disk is
  // ephemeral so writing it to /tmp would only lose it on the next deploy.
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_RESUME_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      return cb(new BadRequestError('upload a PDF, DOC or DOCX file'));
    }
    cb(null, true);
  },
});

const single = upload.single('resume');

// Multer reports its own failures (size, count) through callbacks rather than
// throwing, so they are translated into the app's error type here.
export const uploadResume = (req, res, next) =>
  single(req, res, (error) => {
    if (!error) return next();
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new BadRequestError('the file must be 5MB or smaller'));
    }
    next(error instanceof BadRequestError ? error : new BadRequestError(error.message));
  });
