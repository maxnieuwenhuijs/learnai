const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // Can be null for system actions
        references: {
            model: 'users',
            key: 'id'
        }
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    action: {
        type: DataTypes.STRING(100),
        allowNull: false
        // Examples: 'company_created', 'user_deleted', 'prompt_approved', 'database_reset'
    },
    entity_type: {
        type: DataTypes.STRING(50),
        allowNull: true
        // Examples: 'company', 'user', 'prompt', 'course', 'system'
    },
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: true
        // ID of the affected entity
    },
    old_values: {
        type: DataTypes.JSON,
        allowNull: true
        // Store old values for update/delete operations
    },
    new_values: {
        type: DataTypes.JSON,
        allowNull: true
        // Store new values for create/update operations
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
        // Additional context like IP address, user agent, etc.
    },
    severity: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'low'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
        // Human-readable description of the action
    }
}, {
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: false, // Audit logs should not be updated
    indexes: [
        {
            fields: ['user_id']
        },
        {
            fields: ['company_id']
        },
        {
            fields: ['action']
        },
        {
            fields: ['entity_type', 'entity_id']
        },
        {
            fields: ['created_at']
        },
        {
            fields: ['severity']
        }
    ]
});

module.exports = AuditLog;
