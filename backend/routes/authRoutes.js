import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { login, logout, register } from '../controllers/authController.js';
import {
  validateLoginInput,
  validateRegisterInput,
} from '../middleware/validationMiddleware.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  message: { message: 'too many requests, try again in 15 minutes' },
});

const router = Router();

router.post('/register', authLimiter, validateRegisterInput, register);
router.post('/login', authLimiter, validateLoginInput, login);
router.get('/logout', logout);

export default router;
