const { Sequelize } = require('sequelize');

// Don't call dotenv.config() here - it's already loaded in server.js
// This prevents double loading which causes empty environment variables
console.log("THE PASSWORD MY CODE SEES IS:", process.env.DB_PASSWORD);
// Create Sequelize instance
const sequelize = new Sequelize(
    process.env.DB_NAME || 'elearning_platform',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        timezone: '+00:00' // UTC timezone
    }
);

module.exports = { sequelize };
