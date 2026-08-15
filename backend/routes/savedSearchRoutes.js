import { Router } from 'express';
import {
  createSavedSearch,
  deleteSavedSearch,
  getSavedSearches,
  markSearchSeen,
} from '../controllers/savedSearchController.js';

const router = Router();

router.route('/').get(getSavedSearches).post(createSavedSearch);
router.patch('/:id/seen', markSearchSeen);
router.delete('/:id', deleteSavedSearch);

export default router;
