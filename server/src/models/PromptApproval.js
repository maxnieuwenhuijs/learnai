const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PromptApproval = sequelize.define('PromptApproval', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    prompt_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'prompts',
            key: 'id'
        }
    },
    version_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'prompt_versions',
            key: 'id'
        }
    },
    requested_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reviewer_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'changes_requested'),
        defaultValue: 'pending'
    },
    request_type: {
        type: DataTypes.ENUM('new_prompt', 'version_update', 'status_change', 'deletion'),
        allowNull: false
    },
    comments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    reviewer_comments: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    requested_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    reviewed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    priority: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
        defaultValue: 'medium'
    }
}, {
    tableName: 'prompt_approvals',
    timestamps: false,
    indexes: [
        {
            fields: ['prompt_id']
        },
        {
            fields: ['requested_by']
        },
        {
            fields: ['reviewer_id']
        },
        {
            fields: ['status']
        },
        {
            fields: ['request_type']
        },
        {
            fields: ['requested_at']
        }
    ]
});

module.exports = PromptApproval;