const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PromptVersion = sequelize.define('PromptVersion', {
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
    version_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    variables: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    change_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'rejected'),
        defaultValue: 'draft'
    },
    is_current: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'prompt_versions',
    timestamps: false,
    indexes: [
        {
            fields: ['prompt_id']
        },
        {
            fields: ['version_number']
        },
        {
            fields: ['status']
        },
        {
            fields: ['is_current']
        },
        {
            unique: true,
            fields: ['prompt_id', 'version_number']
        }
    ]
});

module.exports = PromptVersion;