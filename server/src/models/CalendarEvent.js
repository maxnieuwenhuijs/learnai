const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CalendarEvent = sequelize.define('CalendarEvent', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'User this event belongs to'
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'courses',
            key: 'id'
        },
        comment: 'Related course if applicable'
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'companies',
            key: 'id'
        },
        comment: 'Company-wide events'
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'id'
        },
        comment: 'Department-specific events'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    event_type: {
        type: DataTypes.ENUM('deadline', 'meeting', 'exam', 'training', 'webinar', 'holiday', 'other'),
        allowNull: false,
        defaultValue: 'other'
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    all_day: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    location: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Physical location or meeting link'
    },
    is_online: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    meeting_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'Virtual meeting URL'
    },
    color: {
        type: DataTypes.STRING(7),
        allowNull: true,
        defaultValue: '#3b82f6',
        comment: 'Event color in hex format'
    },
    reminder_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Minutes before event to send reminder'
    },
    recurring: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    recurrence_pattern: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Recurrence rules (daily, weekly, monthly, etc.)'
    },
    attendees: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'List of attendee user IDs'
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    is_mandatory: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'scheduled'
    }
}, {
    tableName: 'calendar_events',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id', 'start_date']
        },
        {
            fields: ['course_id']
        },
        {
            fields: ['company_id', 'department_id']
        },
        {
            fields: ['event_type']
        },
        {
            fields: ['start_date', 'end_date']
        }
    ]
});

// Instance method to check if event is happening now
CalendarEvent.prototype.isHappeningNow = function () {
    const now = new Date();
    return now >= this.start_date && now <= this.end_date;
};

// Class method to get upcoming events
CalendarEvent.getUpcomingEvents = async function (userId, days = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    return await this.findAll({
        where: {
            user_id: userId,
            start_date: {
                [sequelize.Op.between]: [startDate, endDate]
            },
            status: 'scheduled'
        },
        order: [['start_date', 'ASC']]
    });
};

// Class method to get events for a specific date range
CalendarEvent.getEventsInRange = async function (userId, startDate, endDate) {
    return await this.findAll({
        where: {
            user_id: userId,
            start_date: {
                [sequelize.Op.lte]: endDate
            },
            end_date: {
                [sequelize.Op.gte]: startDate
            }
        },
        order: [['start_date', 'ASC']]
    });
};

module.exports = CalendarEvent;