const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ReportSchedule = sequelize.define('ReportSchedule', {
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
        },
        comment: 'User who created the schedule'
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'companies',
            key: 'id'
        },
        comment: 'Company scope for the report'
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'id'
        },
        comment: 'Department scope for the report'
    },
    report_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    report_type: {
        type: DataTypes.ENUM(
            'compliance',
            'progress',
            'completion',
            'engagement',
            'team_performance',
            'course_analytics',
            'certificate_summary',
            'custom'
        ),
        allowNull: false
    },
    frequency: {
        type: DataTypes.ENUM('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'once'),
        allowNull: false
    },
    day_of_week: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 0,
            max: 6
        },
        comment: '0 = Sunday, 6 = Saturday (for weekly reports)'
    },
    day_of_month: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1,
            max: 31
        },
        comment: 'Day of month for monthly reports'
    },
    time_of_day: {
        type: DataTypes.TIME,
        allowNull: false,
        defaultValue: '09:00:00',
        comment: 'Time to generate the report'
    },
    recipients: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: [],
        comment: 'Array of email addresses to send report to'
    },
    cc_recipients: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: [],
        comment: 'CC recipients for the report'
    },
    format: {
        type: DataTypes.ENUM('pdf', 'excel', 'csv', 'html'),
        allowNull: false,
        defaultValue: 'pdf'
    },
    last_run: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Last time report was generated'
    },
    next_run: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Next scheduled run time'
    },
    config: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Report-specific configuration (filters, parameters, etc.)'
    },
    filters: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
        comment: 'Filters to apply to report data'
    },
    include_charts: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    include_summary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    language: {
        type: DataTypes.STRING(5),
        allowNull: false,
        defaultValue: 'en',
        comment: 'Language for report generation'
    },
    timezone: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'UTC',
        comment: 'Timezone for scheduling'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    failure_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of consecutive failures'
    },
    last_error: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Last error message if generation failed'
    }
}, {
    tableName: 'report_schedules',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['next_run', 'is_active']
        },
        {
            fields: ['report_type']
        },
        {
            fields: ['company_id', 'department_id']
        }
    ]
});

// Instance method to calculate next run time
ReportSchedule.prototype.calculateNextRun = function() {
    const now = new Date();
    let nextRun = new Date();
    
    // Parse time_of_day
    const [hours, minutes] = this.time_of_day.split(':').map(Number);
    
    switch (this.frequency) {
        case 'daily':
            nextRun.setHours(hours, minutes, 0, 0);
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1);
            }
            break;
            
        case 'weekly':
            nextRun.setHours(hours, minutes, 0, 0);
            const targetDay = this.day_of_week || 1; // Default to Monday
            const currentDay = nextRun.getDay();
            const daysToAdd = (targetDay - currentDay + 7) % 7 || 7;
            nextRun.setDate(nextRun.getDate() + daysToAdd);
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 7);
            }
            break;
            
        case 'biweekly':
            nextRun.setHours(hours, minutes, 0, 0);
            const biweeklyTargetDay = this.day_of_week || 1;
            const biweeklyCurrentDay = nextRun.getDay();
            const biweeklyDaysToAdd = (biweeklyTargetDay - biweeklyCurrentDay + 7) % 7 || 7;
            nextRun.setDate(nextRun.getDate() + biweeklyDaysToAdd);
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 14);
            }
            break;
            
        case 'monthly':
            const targetDayOfMonth = Math.min(this.day_of_month || 1, 28); // Avoid month-end issues
            nextRun.setDate(targetDayOfMonth);
            nextRun.setHours(hours, minutes, 0, 0);
            if (nextRun <= now) {
                nextRun.setMonth(nextRun.getMonth() + 1);
            }
            break;
            
        case 'quarterly':
            const currentMonth = now.getMonth();
            const nextQuarterMonth = Math.floor(currentMonth / 3) * 3 + 3;
            nextRun.setMonth(nextQuarterMonth);
            nextRun.setDate(1);
            nextRun.setHours(hours, minutes, 0, 0);
            if (nextRun <= now) {
                nextRun.setMonth(nextRun.getMonth() + 3);
            }
            break;
            
        case 'yearly':
            nextRun.setMonth(0, 1); // January 1st
            nextRun.setHours(hours, minutes, 0, 0);
            if (nextRun <= now) {
                nextRun.setFullYear(nextRun.getFullYear() + 1);
            }
            break;
            
        case 'once':
            // For one-time reports, next_run should be null after execution
            if (this.last_run) {
                return null;
            }
            nextRun.setHours(hours, minutes, 0, 0);
            if (nextRun <= now) {
                nextRun.setDate(nextRun.getDate() + 1);
            }
            break;
    }
    
    this.next_run = nextRun;
    return nextRun;
};

// Instance method to mark as executed
ReportSchedule.prototype.markAsExecuted = async function(success = true, error = null) {
    this.last_run = new Date();
    
    if (success) {
        this.failure_count = 0;
        this.last_error = null;
        if (this.frequency !== 'once') {
            this.calculateNextRun();
        } else {
            this.next_run = null;
            this.is_active = false;
        }
    } else {
        this.failure_count += 1;
        this.last_error = error;
        
        // Disable after 5 consecutive failures
        if (this.failure_count >= 5) {
            this.is_active = false;
        }
    }
    
    await this.save();
    return this;
};

// Class method to get schedules due for execution
ReportSchedule.getSchedulesDue = async function() {
    const now = new Date();
    
    return await this.findAll({
        where: {
            is_active: true,
            next_run: {
                [sequelize.Op.lte]: now
            }
        },
        order: [['next_run', 'ASC']]
    });
};

module.exports = ReportSchedule;