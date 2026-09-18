import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';
import { sendNotification } from '../utils/notifications.js';

// Get current user's notifications
export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = Math.min(50, Number(req.query.limit) || 20);

    const [notifications, unreadCount, total] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean(),
      Notification.countDocuments({ userId, isRead: false }),
      Notification.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      total,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark a single notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      success: true,
      message: 'Notification marked as read',
      notification,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read for current user
export const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    res.json({
      success: true,
      message: 'All notifications marked as read',
      unreadCount: 0,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a single notification
export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const deleted = await Notification.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
      throw new AppError('Notification not found', 404);
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    res.json({
      success: true,
      message: 'Notification deleted',
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// Clear all read notifications
export const clearReadNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    await Notification.deleteMany({ userId, isRead: true });

    res.json({
      success: true,
      message: 'Read notifications cleared successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Send a Live Multi-Channel Test Notification (In-App + Email + SMS + WhatsApp)
export const sendTestNotification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const testTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    const result = await sendNotification({
      type: 'test',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      shopName: 'Barabar Royal Studio',
      customTitle: `Live Multi-Channel Test Alert`,
      customMessage: `Test notification sent at ${testTime} to ${user.email} & ${user.phone || 'no phone registered'}. All notification channels (In-App, Email, SMS & WhatsApp) are operating normally!`,
      link: '/dashboard',
      tab: 'overview',
      metadata: { testTriggeredAt: new Date() },
    });

    res.json({
      success: true,
      message: `Test notification dispatched successfully! Check your email (${user.email}) and phone (${user.phone || 'N/A'})!`,
      result,
    });
  } catch (error) {
    next(error);
  }
};
