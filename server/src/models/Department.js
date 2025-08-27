const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Department = sequelize.define('Department', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(255),
        allowNull: false
    }
}, {
    tableName: 'departments',
    timestamps: false
});

module.exports = Department;