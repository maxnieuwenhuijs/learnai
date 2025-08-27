const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserProgress = sequelize.define('UserProgress', {
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
    lesson_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'lessons',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('not_started', 'in_progress', 'completed'),
        allowNull: false,
        defaultValue: 'not_started'
    },
    started_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    completed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    time_spent_seconds: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    quiz_score: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    }
}, {
    tableName: 'user_progress',
    timestamps: true,
    createdAt: false,
    updatedAt: 'last_accessed_at',
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'lesson_id']
        }
    ]
});

module.exports = UserProgress;