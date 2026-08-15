import { Router } from 'express';
import {
  getAllJobs,
  getFilters,
  getJob,
  getJobStats,
  getMatchedJobs,
  getSkillGaps,
} from '../controllers/jobController.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllJobs);
router.get('/filters', getFilters);
router.get('/stats', getJobStats);
router.get('/matches', authenticateUser, getMatchedJobs);
router.get('/skill-gaps', authenticateUser, getSkillGaps);
router.get('/:slug', getJob);

export default router;
