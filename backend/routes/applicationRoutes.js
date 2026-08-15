import { Router } from 'express';
import {
  deleteApplication,
  getApplicationStats,
  getMyApplications,
  trackJob,
  updateApplication,
} from '../controllers/applicationController.js';

const router = Router();

router.route('/').get(getMyApplications).post(trackJob);
router.get('/stats', getApplicationStats);
router.route('/:id').patch(updateApplication).delete(deleteApplication);

export default router;
