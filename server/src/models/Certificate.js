const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Certificate = sequelize.define('Certificate', {
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
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    certificate_uid: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
    },
    verification_code: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true
    },
    issued_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    valid_until: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('active', 'revoked', 'expired'),
        allowNull: false,
        defaultValue: 'active'
    },
    settings: {
        type: DataTypes.JSON,
        allowNull: true
    },
    final_score: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    completion_time: {
        type: DataTypes.INTEGER, // in minutes
        allowNull: true
    }
}, {
    tableName: 'certificates',
    timestamps: true,
    createdAt: 'issued_at',
    updatedAt: 'updated_at'
});

module.exports = Certificate;