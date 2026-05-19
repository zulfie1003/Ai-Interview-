import express from 'express';
import {
  startInterview,
  sendMessage,
  getHistory,
  getInterview,
  abandonInterview,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect); // All interview routes are protected

router.post('/start', startInterview);
router.post('/message', sendMessage);
router.get('/history', getHistory);
router.get('/:id', getInterview);
router.put('/:id/abandon', abandonInterview);

export default router;
