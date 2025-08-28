const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    type: {
        type: DataTypes.ENUM('system', 'course_update', 'deadline', 'assignment', 'achievement', 'announcement'),
        allowNull: false,
        defaultValue: 'system'
    },
    read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
    },
    action_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL to navigate when notification is clicked'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Additional data for the notification'
    }
}, {
    tableName: 'notifications',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id', 'read']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['type']
        }
    ]
});

// Instance method to mark as read
Notification.prototype.markAsRead = async function() {
    this.read = true;
    await this.save();
    return this;
};

// Class method to mark multiple notifications as read
Notification.markMultipleAsRead = async function(notificationIds, userId) {
    return await this.update(
        { read: true },
        { 
            where: { 
                id: notificationIds,
                user_id: userId
            }
        }
    );
};

// Class method to get unread count
Notification.getUnreadCount = async function(userId) {
    return await this.count({
        where: {
            user_id: userId,
            read: false
        }
    });
};

module.exports = Notification;