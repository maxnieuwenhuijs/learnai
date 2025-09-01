const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PromptUsage = sequelize.define('PromptUsage', {
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
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    version_used: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    variables_data: {
        type: DataTypes.JSON,
        allowNull: true
        // Stores the actual values used for variables
    },
    generated_content: {
        type: DataTypes.TEXT,
        allowNull: true
        // The final prompt after variable substitution
    },
    context: {
        type: DataTypes.STRING(100),
        allowNull: true
        // Where was this prompt used (e.g., 'course_creation', 'email_template', etc.)
    },
    used_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'prompt_usage',
    timestamps: false,
    indexes: [
        {
            fields: ['prompt_id']
        },
        {
            fields: ['user_id']
        },
        {
            fields: ['used_at']
        },
        {
            fields: ['context']
        }
    ]
});

module.exports = PromptUsage;