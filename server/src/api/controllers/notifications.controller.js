const { Notification, User } = require('../../models');
const { Op } = require('sequelize');

/**
 * Get notifications for the authenticated user
 */
const getNotifications = async (req, res) => {
  try {
    const { type, isRead, limit = 50 } = req.query;
    const whereClause = {
      [Op.or]: [
        { userId: req.user.id },
        { userId: null } // Global notifications
      ]
    };

    // Filter by type if specified
    if (type && type !== 'all') {
      whereClause.type = type;
    }

    // Filter by read status if specified
    if (isRead !== undefined) {
      whereClause.isRead = isRead === 'true';
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    const unreadCount = await Notification.count({
      where: {
        [Op.or]: [
          { userId: req.user.id },
          { userId: null }
        ],
        isRead: false
      }
    });

    res.json({
      success: true,
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
};

/**
 * Mark a specific notification as read
 */
const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        [Op.or]: [
          { userId: req.user.id },
          { userId: null }
        ]
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
};

/**
 * Mark all notifications as read for the authenticated user
 */
const markAllAsRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      {
        where: {
          [Op.or]: [
            { userId: req.user.id },
            { userId: null }
          ],
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark all notifications as read'
    });
  }
};

/**
 * Delete a specific notification
 */
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId: req.user.id // Only allow users to delete their own notifications
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found or access denied'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
};

/**
 * Create a new notification (Admin/System use)
 */
const createNotification = async (req, res) => {
  try {
    const { title, message, type, userId, actionUrl } = req.body;

    // Validate required fields
    if (!title || !message || !type) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, and type are required'
      });
    }

    // Validate notification type
    const validTypes = ['system', 'course', 'deadline', 'achievement', 'team'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }

    const notification = await Notification.create({
      title,
      message,
      type,
      userId: userId || null, // null for global notifications
      actionUrl: actionUrl || null,
      isRead: false
    });

    res.status(201).json({
      success: true,
      notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create notification'
    });
  }
};

/**
 * Get notification statistics
 */
const getNotificationStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Notification.findAll({
      where: {
        [Op.or]: [
          { userId },
          { userId: null }
        ]
      },
      attributes: [
        'type',
        [Notification.sequelize.fn('COUNT', '*'), 'count'],
        [Notification.sequelize.fn('SUM', 
          Notification.sequelize.literal('CASE WHEN isRead = false THEN 1 ELSE 0 END')
        ), 'unreadCount']
      ],
      group: ['type'],
      raw: true
    });

    const totalCount = await Notification.count({
      where: {
        [Op.or]: [
          { userId },
          { userId: null }
        ]
      }
    });

    const totalUnreadCount = await Notification.count({
      where: {
        [Op.or]: [
          { userId },
          { userId: null }
        ],
        isRead: false
      }
    });

    res.json({
      success: true,
      stats: {
        byType: stats,
        total: totalCount,
        unread: totalUnreadCount
      }
    });
  } catch (error) {
    console.error('Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics'
    });
  }
};

/**
 * Bulk create notifications for multiple users
 */
const bulkCreateNotifications = async (req, res) => {
  try {
    const { title, message, type, userIds, actionUrl } = req.body;

    // Validate required fields
    if (!title || !message || !type || !Array.isArray(userIds)) {
      return res.status(400).json({
        success: false,
        message: 'Title, message, type, and userIds array are required'
      });
    }

    // Validate notification type
    const validTypes = ['system', 'course', 'deadline', 'achievement', 'team'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification type'
      });
    }

    // Create notifications for all specified users
    const notifications = userIds.map(userId => ({
      title,
      message,
      type,
      userId,
      actionUrl: actionUrl || null,
      isRead: false
    }));

    const createdNotifications = await Notification.bulkCreate(notifications);

    res.status(201).json({
      success: true,
      notifications: createdNotifications,
      count: createdNotifications.length,
      message: `${createdNotifications.length} notifications created successfully`
    });
  } catch (error) {
    console.error('Bulk create notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk notifications'
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  getNotificationStats,
  bulkCreateNotifications
};