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
    }
}, {
    tableName: 'certificates',
    timestamps: true,
    createdAt: 'issued_at',
    updatedAt: false
});

module.exports = Certificate;