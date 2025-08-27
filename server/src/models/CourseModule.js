const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CourseModule = sequelize.define('CourseModule', {
    course_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'courses',
            key: 'id'
        }
    },
    module_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        references: {
            model: 'modules',
            key: 'id'
        }
    },
    module_order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'course_modules',
    timestamps: false
});

module.exports = CourseModule;