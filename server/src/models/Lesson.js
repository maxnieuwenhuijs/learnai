const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Lesson = sequelize.define('Lesson', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    module_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'modules',
            key: 'id'
        }
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    content_type: {
        type: DataTypes.ENUM('video', 'text', 'quiz', 'lab_simulation'),
        allowNull: false
    },
    content_data: {
        type: DataTypes.JSON,
        allowNull: true
    },
    lesson_order: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'lessons',
    timestamps: false
});

module.exports = Lesson;