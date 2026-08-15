import 'express-async-errors';
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';

import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import userRoutes from './routes/userRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import savedSearchRoutes from './routes/savedSearchRoutes.js';

import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import { UnauthorizedError } from './errors/customErrors.js';
import { authenticateUser } from './middleware/auth.js';
import { startScheduler } from './services/scheduler.js';

const app = express();

// Render terminates TLS at its proxy, so without this Express sees every
// request as coming from the proxy: the rate limiter would bucket the entire
// internet into one client, and req.secure would always be false.
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);

// CLIENT_URL accepts a comma-separated list so Netlify deploy previews can be
// allowed alongside the production site.
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim().replace(/\/$/, ''))
  .filter(Boolean);

const isProduction = process.env.NODE_ENV === 'production';

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      // Same-origin and server-to-server calls arrive without an Origin header.
      if (!origin) return callback(null, true);

      const clean = origin.replace(/\/$/, '');
      if (allowedOrigins.includes(clean)) return callback(null, true);

      // Vite takes the next free port when the default is busy, so pinning dev
      // to a single localhost port makes the API reject its own frontend.
      if (!isProduction && /^https?:\/\/localhost(:\d+)?$/.test(clean)) {
        return callback(null, true);
      }

      // A rejected origin is a forbidden request, not a server fault.
      callback(new UnauthorizedError(`origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', service: 'talentifyx-api' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/users', authenticateUser, userRoutes);
app.use('/api/v1/applications', authenticateUser, applicationRoutes);
app.use('/api/v1/saved-searches', authenticateUser, savedSearchRoutes);

app.use('*', (req, res) => {
  res.status(404).json({ message: 'route not found' });
});

app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5004;
try {
  await mongoose.connect(process.env.MONGO_URI);
  app.listen(PORT, () => console.log(`Talentifyx API running on port ${PORT}`));
  startScheduler();
} catch (error) {
  console.error(error);
  process.exit(1);
}
