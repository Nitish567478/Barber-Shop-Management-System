import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  sendTestNotification,
} from '../controllers/notificationController.js';

const router = express.Router();

// All notification routes require authentication
router.use(authenticateToken);

router.get('/', getNotifications);
router.post('/test', sendTestNotification);
router.put('/read-all', markAllAsRead);
router.put('/:id/read', markAsRead);
router.delete('/clear-all', clearReadNotifications);
router.delete('/:id', deleteNotification);

export default router;
