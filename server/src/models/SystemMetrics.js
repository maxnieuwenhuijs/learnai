const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SystemMetrics = sequelize.define('SystemMetrics', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    metric_name: {
        type: DataTypes.STRING(100),
        allowNull: false
        // Examples: 'cpu_usage', 'memory_usage', 'disk_usage', 'active_users', 'response_time'
    },
    metric_value: {
        type: DataTypes.DECIMAL(10, 4),
        allowNull: false
        // Numeric value of the metric
    },
    metric_unit: {
        type: DataTypes.STRING(20),
        allowNull: true
        // Examples: 'percentage', 'ms', 'bytes', 'count'
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'system'
        // Examples: 'system', 'database', 'application', 'user_activity'
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
        // Additional context about the metric
    },
    recorded_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'system_metrics',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Metrics are historical records
    indexes: [
        {
            fields: ['metric_name']
        },
        {
            fields: ['category']
        },
        {
            fields: ['recorded_at']
        },
        {
            fields: ['metric_name', 'recorded_at']
        }
    ]
});

module.exports = SystemMetrics;
