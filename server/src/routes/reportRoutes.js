import express from 'express';
import {
  createReport,
  getReports,
  verifyReport,
} from '../controllers/reportController.js';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', authorizeRole('customer'), createReport);
router.get('/admin', authorizeRole('admin'), getReports);
router.put('/admin/:id/verify', authorizeRole('admin'), verifyReport);

export default router;
