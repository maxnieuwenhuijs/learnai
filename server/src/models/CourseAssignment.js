const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseAssignment = sequelize.define('CourseAssignment', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'courses',
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
    }
}, {
    tableName: 'course_assignments',
    timestamps: true,
    createdAt: 'assigned_at',
    updatedAt: false
});

module.exports = CourseAssignment;