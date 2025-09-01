const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Prompt = sequelize.define('Prompt', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
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
        // Format: [{ name: "user_name", type: "string", default: "", description: "Name of the user" }]
    },
    category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'prompt_categories',
            key: 'id'
        }
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    version: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
    status: {
        type: DataTypes.ENUM('draft', 'pending_review', 'approved', 'rejected', 'archived'),
        defaultValue: 'draft'
    },
    is_template: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'prompts',
            key: 'id'
        }
    },
    tags: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: []
    },
    usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    last_used_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'prompts',
    timestamps: false,
    indexes: [
        {
            fields: ['category_id']
        },
        {
            fields: ['company_id']
        },
        {
            fields: ['department_id']
        },
        {
            fields: ['created_by']
        },
        {
            fields: ['status']
        },
        {
            fields: ['is_template']
        },
        {
            fields: ['parent_id']
        }
    ]
});

module.exports = Prompt;