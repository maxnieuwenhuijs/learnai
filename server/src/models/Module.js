const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Module = sequelize.define('Module', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    estimated_duration_minutes: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'modules',
    timestamps: false
});

module.exports = Module;