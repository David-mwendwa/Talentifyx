import { Router } from 'express';
import {
  deleteResume,
  downloadResume,
  getCurrentUser,
  updateProfile,
  uploadResumeFile,
} from '../controllers/userController.js';
import { validateProfileInput } from '../middleware/validationMiddleware.js';
import { uploadResume } from '../middleware/uploadMiddleware.js';

const router = Router();

router.get('/current-user', getCurrentUser);
router.patch('/profile', validateProfileInput, updateProfile);

router
  .route('/resume')
  .post(uploadResume, uploadResumeFile)
  .get(downloadResume)
  .delete(deleteResume);

export default router;
