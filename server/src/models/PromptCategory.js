const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PromptCategory = sequelize.define('PromptCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    color: {
        type: DataTypes.STRING(7),
        allowNull: true,
        defaultValue: '#6366f1' // Default indigo color
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'MessageSquare'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // null means system-wide category
        references: {
            model: 'companies',
            key: 'id'
        }
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
    tableName: 'prompt_categories',
    timestamps: false,
    indexes: [
        {
            fields: ['company_id']
        },
        {
            fields: ['name']
        }
    ]
});

module.exports = PromptCategory;